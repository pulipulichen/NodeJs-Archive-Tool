const Database = require('better-sqlite3');

let main = function (attrs, targetFile, dbHandler) {
  
  if (!dbHandler) {
    dbHandler = buildDBHandler(attrs, targetFile)
  }
  
  dbHandler(attrs)
}

function buildDBHandler (attrs, targetFile) {
  const db = new Database(targetFile + '.sqlite')
  
  let createTableSQL = buildCreateTableSQL(attrs)
  db.exec(createTableSQL);
  
  let prepareSQL = buildPrepareSQL(attrs)
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
    id INTEGER AUTOINCREMENT PRIMARY KEY,
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
  let columns = Object.key(attrs) 
  let columnsAt = columns.map(c => '@' + c)

  return `INSERT INTO filelist (${columns.join(', ')}) VALUES (${columnsAt.join(', ')})`
}

module.exports = main