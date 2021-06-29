const Database = require('better-sqlite3');
const db = new Database('foobar.sqlite', { verbose: console.log });

// ---------------------

db.exec(`
CREATE TABLE cats (
	name text PRIMARY KEY ,
  age INTEGER NOT NULL
) WITHOUT ROWID;
`);

// ---------------------

const insert = db.prepare('INSERT INTO cats (name, age) VALUES (@name, @age)');

const insertMany = db.transaction((cats) => {
  for (const cat of cats) insert.run(cat);
});

insertMany([
  { name: 'Joey', age: 2 },
  { name: 'Sally', age: 4 },
  { name: 'Junior', age: 1 },
]);