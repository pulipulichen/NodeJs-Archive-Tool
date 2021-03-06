/* global path, __dirname, cacheClass, sequelize, databases, databaseName */

const {Sequelize, Model, DataTypes, Op} = require('sequelize')

const EXPIRE_RANGE_MINUTE = 60
//const LZUTF8 = require('lzutf8')
//const ENABLE_COMPRESS = false

//class Cache extends Model {
//}
let fs = require('fs')
let path = require('path')


let _this = {}
let enableCache = true

let tryToRestartServer = (() => {
  let counter = 10

  let restartServer = function () {
    let content = JSON.stringify({
      date: (new Date()).getTime()
    })
    console.log('restart server...')
    fs.writeFile(path.resolve(__dirname, 'restart-trigger.json'), content, () => {

    })
  }

  return async function (callback) {
    while (true) {
      try {
        await callback()

        if (counter < 10) {
          counter = 10
        }

        break
      }
      catch (e) {
        console.error(e)
        counter--

        if (counter < 0) {
          return restartServer()
        }

        console.log('[RETRY ' + counter  + ']')

        await sleep(3000)
      }
    }

  }
})()

_this.inited = false

_this.sequelize = null
_this.lastCleanTime = (new Date()).getTime()
//_this.cleanInterval = 3 * 60 * 1000
_this.cleanInterval = 100

let sleep = function (time = 100) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

let isLoading = false

_this.init = async function () {
  if (_this.inited === true) {
    return true
  }
//
//  _this.sequelize = new Sequelize({
//    host: 'localhost',
//    dialect: 'sqlite',
//
//    pool: {
//      max: 5,
//      min: 0,
//      acquire: 30000,
//      idle: 10000
//    },
//    storage: './database/node-cache.sqlite',
//    operatorsAliases: 0,
//    logging: false,
//    transactionType: 'IMMEDIATE'
//  })
//
//  Cache.init({
//    key: DataTypes.STRING,
//    value: DataTypes.STRING,
//    type: DataTypes.STRING,
//    createdTime: DataTypes.NUMBER,
//    expireTime: DataTypes.NUMBER
//  }, {
//    sequelize: this.sequelize,
//    modelName: 'cache',
//    timestamps: false,
//  });
//
//  await _this.sequelize.sync()

  _this.databases = {}

  _this.inited = true
}

_this.getDatabase = async function (databaseName) {
  
  if (!this.databases[databaseName]) {
    let sequelize = new Sequelize({
      host: 'localhost',
      dialect: 'sqlite',

      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      storage: path.resolve(__dirname, 'node-cache_' + databaseName + '.sqlite'),
      operatorsAliases: 0,
      logging: false,
      transactionType: 'IMMEDIATE'
    })

    let cacheClass = (class CacheClass extends Model {})

    cacheClass.init({
      key: DataTypes.STRING,
      value: DataTypes.STRING,
      type: DataTypes.STRING,
      createdTime: DataTypes.NUMBER,
      expireTime: DataTypes.NUMBER
    }, {
      sequelize: sequelize,
      modelName: 'cache',
      timestamps: false,
    });

    await sequelize.sync()

    this.databases[databaseName] = cacheClass 
  }
  
  return this.databases[databaseName]
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

_this.adjustExpire = function (expire) {
  if (expire === 0) {
    return 0
  }
  if (typeof(expire) === 'number') {
    expire = expire + randomIntFromInterval(0, EXPIRE_RANGE_MINUTE * 60 * 1000)
  }
  
  return expire
}

/**
 * 
 * @param {type} key
 * @param {type} value
 * @param {type} expire ???????????????
 * @returns {_this.set.originalValue|_this.set.value}
 */
_this.set = async function (databaseName, key, value, expire = null) {
  //console.log(expire)
  await _this.init()
  
  if (typeof (key) !== 'string') {
    if (typeof (key) === 'function') {
      key = await key()
    }
    key = JSON.stringify(key)
  }

  let type = typeof (value)
  if (type === 'function') {
    value = await value()
    type = typeof(value)
  }
  
  let originalValue = value
  if (enableCache === false) {
    return originalValue
  }
  if (type !== 'string') {
    value = JSON.stringify(value)
  }

//  while (isLoading === true) {
//    //console.log('cache wait while set')
//    await sleep()
//  }
  //console.log('cache load by set')
  //isLoading = true

  expire = _this.adjustExpire(expire)

  // ??????
  let processedValue = value
  
//  if (ENABLE_COMPRESS === true) {
//    processedValue = LZUTF8.compress(processedValue, {
//      outputEncoding: 'Base64'
//    })
//  }
  
  let database = await this.getDatabase(databaseName)
  
  const [cache, created] = await database.findOrCreate({
    where: {key},
    defaults: {
      value: processedValue,
      createdTime: (new Date()).getTime(),
      expireTime: _this.calcExpire(expire),
      type
    }
  })
  
  //console.log(cache)  
  
//  isLoading = false

  if (created === false) {
    cache.value = value
    //cache.createdTime = _this.calcExpire(expire)
    cache.createdTime = (new Date()).getTime()
    cache.type = type
    tryToRestartServer(async () => {
      await cache.save()
    })
  }

  await _this.autoClean(databaseName)

  isLoading = false
  return originalValue
}

_this.autoClean = async function (databaseName) {
  let time = (new Date()).getTime()

  if (_this.lastCleanTime + _this.cleanInterval > time) {
    return false
  }
  /*
  
  */
  while (isLoading === true) {
    //console.log('cache wait while autoClean')
    await sleep()
  }
  //console.log('cache load by autoClean')
  //isLoading = true
  
  let database = await this.getDatabase(databaseName)
  await database.destroy({
    where: {
      [Op.and]: [
        {expireTime: {
            [Op.not]: null
          }},
        {expireTime: {
            [Op.lt]: time
          }}
      ]
    }
  })
  isLoading = false

  _this.lastCleanTime = time
  
  //isLoading = false
  return true
}

/**
 * 
 * @param {Number} expire ???????????????
 * @returns {NodeCacheSqlite.calcExpire.time|Number}
 */
_this.calcExpire = function (expire) {
  if (!expire) {
    return undefined
  }
  
  let time = (new Date()).getTime()

  time = time + expire

  return time
}

_this.getExists = async function (databaseName, key, value, expire) {
  let result = await _this.get(databaseName, key, value, expire)
  
  if (!result) {
    //console.log('[CACHE] getExists ????????????')
    await this.clear(databaseName, key)
    //return await _this.get(key, value, expire)
  }
  return result
}

_this.get = async function (databaseName, key, value, expire) {
  await _this.init()


//  if (expire === 0) {
//    expire = undefined
//  }

  if (typeof (key) !== 'string') {
    if (typeof (key) === 'function') {
      key = await key()
    }
    key = JSON.stringify(key)
  }
  
  //console.log(expire)
  
  await _this.autoClean(databaseName)

  
  while (isLoading === true) {
    //console.log('cache wait while get')
    await sleep()
  }
  //console.log('cache load by get')
  //isLoading = true
  
  let cache = null
  if (enableCache === true) {
    let database = await this.getDatabase(databaseName)
    cache = await database.findOne({
      where: {
        key
      }
    })
  }
  isLoading = false
  /*
  if (key === '["LocalFolder","harry-potter-and-the-sorcerers-stone","items"]') {
    console.log([
      (cache === null),
      expire,
      cache.expire,
      (new Date()).getTime(),
      (cache.expire < (new Date()).getTime())
    ])
  }
  */
 
  expire = _this.adjustExpire(expire)
 
//  if (cache !== null) { 
//    console.log(key)
//    console.log(cache.createdTime, expire, ((new Date()).getTime()) - cache.createdTime
//      , (cache === null),  (expire === null || expire === undefined)
//      , (!cache.createdTime || ((new Date()).getTime()) - cache.createdTime > expire))
//  }
  if ( (cache === null) 
          || ( (expire !== null && expire !== undefined) && (!cache.createdTime || ((new Date()).getTime()) - cache.createdTime > expire) ) ) {
//    console.log('??????????????????', value)
    if (value !== undefined) {
      //console.log('??????????????????', key, expire)
      let result
      //tryToRestartServer(async () => {
        result = await _this.set(databaseName, key, value, expire)
      //})
      return result
    }
    return undefined
  }

  let cachedProcessedValue = cache.value
  
//  if (ENABLE_COMPRESS === true) {
//    cachedProcessedValue = LZUTF8.decompress(cachedProcessedValue, {
//      inputEncoding: 'Base64'
//    })
//  }
  let cachedValue = cachedProcessedValue
  
  if (cache.type !== 'string') {
    try {
      cachedValue = JSON.parse(cachedValue)
    }
    catch (e) {
      await this.clear(key)
      console.error(cachedValue)
      throw e
    }
  }

  return cachedValue
}

_this.clear = async function (databaseName, key) {
  await _this.init()


  if (typeof (key) !== 'string') {
    if (typeof (key) === 'function') {
      key = await key()
    }
    key = JSON.stringify(key)
  }

//  while (isLoading[databaseName] === true) {
//    //console.log('cache wait while get')
//    await sleep()
//  }
  //console.log('cache load by get')
  //isLoading = true
  
  let database = await this.getDatabase(databaseName)
  await database.destroy({
    where: {
      key
    }
  })
  //isLoading[databaseName] = false
  
  console.log('[CACHE] clear cache: ' + databaseName + ': ' + key)
  return true
}

module.exports = _this