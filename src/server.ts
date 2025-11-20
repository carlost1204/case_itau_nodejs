import express, { Request, Response } from 'express';
import db from './database';

const app = express();
app.use(express.json());

const PORT = 8080;

app.listen(PORT, () => {
  console.log('Server Listening on PORT:', PORT);
});

app.get('/clientes', (req: Request, res: Response) => {
  const query = 'SELECT * FROM clientes';
  db.all(query, [], (err: Error | null, rows: any[]) => {
    if (err) return res.status(400).json({ error: err.message });
    return res.json(rows);
  });
});

app.get('/clientes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const query = 'SELECT * FROM clientes WHERE id = ?';
  db.all(query, [id], (err: Error | null, rows: any[]) => {
    if (err) return res.status(400).json({ error: err.message });
    return res.json(rows);
  });
});

app.post('/clientes', (req: Request, res: Response) => {
  const { nome, email } = req.body;
  db.run(`INSERT INTO clientes(nome, email) VALUES(?, ?)`, [nome, email], function (err: Error | null) {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: (err as Error).message });
    }
    return res.status(200).json({ id: (this as any).lastID });
  });
});

app.put('/clientes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, email } = req.body;
  db.run(`UPDATE clientes SET nome = ?, email = ? WHERE id = ?`, [nome, email, id], function (err: Error | null) {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: (err as Error).message });
    }
    return res.status(200).json({ changes: (this as any).changes });
  });
});

app.delete('/clientes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.run(`DELETE FROM clientes WHERE id = ?`, [id], function (err: Error | null) {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: (err as Error).message });
    }
    return res.status(200).json({ changes: (this as any).changes });
  });
});

app.post('/clientes/:id/depositar', (req: Request, res: Response) => {
  const { id } = req.params;
  const { valor } = req.body;
  console.log({ id, valor });
  db.run(`UPDATE clientes SET saldo = saldo + ? WHERE id = ?`, [valor, id], function (err: Error | null) {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: (err as Error).message });
    }
    return res.status(200).json({ changes: (this as any).changes });
  });
});

app.post('/clientes/:id/sacar', (req: Request, res: Response) => {
  const { id } = req.params;
  const { valor } = req.body;
  console.log({ id, valor });
  db.run(`UPDATE clientes SET saldo = saldo - ? WHERE id = ?`, [valor, id], function (err: Error | null) {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: (err as Error).message });
    }
    return res.status(200).json({ changes: (this as any).changes });
  });
});

export default app;
