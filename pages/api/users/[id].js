// pages/api/users/[id].js
import db from '@/lib/db';
import { withAuth } from '@/lib/auth';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'PUT') {
    const { nama, email, password } = req.body;
    await db.query('UPDATE users SET nama = ?, email = ?, password = ? WHERE id = ?', [nama, email, password, id]);
    return res.status(200).json({ message: 'User berhasil diperbarui' });
  }

  if (req.method === 'DELETE') {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return res.status(200).json({ message: 'User berhasil dihapus' });
  }

  return res.status(405).end();
}

export default withAuth(handler);
