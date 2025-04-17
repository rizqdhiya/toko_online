// pages/api/users/index.js
import db from '@/lib/db';
import { withAuth } from '@/lib/auth';

async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM users');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { name, email, password } = req.body;
    await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    return res.status(201).json({ message: 'User berhasil ditambahkan' });
  }

  return res.status(405).end(); // Method Not Allowed
}

export default withAuth(handler);
