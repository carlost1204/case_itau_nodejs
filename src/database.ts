import * as sqlite3 from 'sqlite3';

const sqlite = sqlite3.verbose();
export const db = new sqlite.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE clientes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        saldo FLOAT
    )`);

  db.run(`INSERT INTO clientes(nome, email, saldo) VALUES(?, ?, 0)`, [
    'TESTE',
    'TESTE@TESTE.com.br',
  ]);
});

export default db;
