import db from '@/lib/db';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { token, userId } = cookie.parse(req.headers.cookie || '');
    if (!token || !userId) {
      return res.status(401).json({ error: "Belum login" });
    }
    const { foto } = req.body;
    await db.query('UPDATE users SET foto = ? WHERE id = ?', [foto, userId]);
    return res.status(200).json({ message: 'Foto profil diupdate' });
  } else if (req.method === 'GET') {
    const { token, userId } = cookie.parse(req.headers.cookie || '');
    if (!token || !userId) return res.status(401).json({ error: "Belum login" });
    const [rows] = await db.query('SELECT id, nama, email, alamat, foto FROM users WHERE id = ?', [userId]);
    return res.status(200).json(rows[0]);
  }
  return res.status(405).end();
}