const Database = require('better-sqlite3');
const dayjs = require('dayjs')
const fs = require('fs')

function main (attrs, targetFile, dbHandler) {
  //console.log(attrs)
  
  targetFile = targetFile + '.sqlite'
  if (!dbHandler) {
    dbHandler = buildDBHandler(attrs, targetFile)
  }
  
  dbHandler(cleanAttrs(attrs))
  
  return {
    fileHandler: dbHandler,
    targetFilePath: targetFile
  }
}

function buildDBHandler (attrs, targetFile) {
  
  let isExists = fs.existsSync(targetFile)
  
  const db = new Database(targetFile)

  if (isExists === false) {
    let createTableSQL = buildCreateTableSQL(attrs)
    db.exec(createTableSQL);
  }
  
  let prepareSQL = buildPrepareSQL(attrs)
  //console.log(prepareSQL)
  const insert = db.prepare(prepareSQL);

  const insertHandler = db.transaction((attr) => {
    insert.run(attr);
  });
  
  return insertHandler
}

/**
 * 
 * @param {type} attrs
 * @returns {undefined}
 * 
 * CREATE TABLE cats (
	name text PRIMARY KEY ,
  age INTEGER NOT NULL
) WITHOUT ROWID;
 */
function buildCreateTableSQL (attrs) {
  let columns = Object.keys(attrs).map(column => {
    let dataType = typeof(attrs[column])
    
    if (dataType === 'string') {
      dataType = 'TEXT'
    }
    if (dataType === 'boolean') {
      dataType = 'INTEGER'
    }
    else if (dataType === 'number') {
      if (attrs[column] % 1 !== 0) {
        dataType = 'REAL'
      }
      else {
        dataType = 'INTEGER'
      }
    }
    else if (attrs[column] instanceof Date) {
      dataType = 'TEXT'
    }
    
    return column + ' ' + dataType
  })
  
  return `CREATE TABLE filelist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
	${columns.join(',\n')}
);`
}

/**
 * 
 * @returns {nm$_addFileListRowSQLite.main}
 * 
 * 'INSERT INTO cats (name, age) VALUES (@name, @age)'
 */
function buildPrepareSQL (attrs) {
  let columns = Object.keys(attrs) 
  let columnsAt = columns.map(c => '@' + c)

  return `INSERT INTO filelist (${columns.join(', ')}) VALUES (${columnsAt.join(', ')})`
}

function cleanAttrs(attrs) {
  let output = {}
  
  Object.keys(attrs).forEach(column => {
    let value = attrs[column]
    
    if (typeof(value) === 'boolean') {
      if (value === true) {
        value = 1
      }
      else {
        value = 0
      }
    }
    else if (value instanceof Date) {
      value = dayjs(value).format('YYYY-MM-DD HH:mm:ss.SSS')
      //console.log(value)
    }
    else if (value === undefined) {
      value = null
    }
    
    output[column] = value
  })
  
  //console.log(output)
  
  return output
}

module.exports = main