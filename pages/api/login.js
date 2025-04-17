// pages/api/login.js
import db from '../../lib/db';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  const [rows] = await db.query(
    'SELECT * FROM admin_users WHERE email = ? AND password = ?',
    [email, password]
  );

  if (rows.length > 0) {
    res.setHeader('Set-Cookie', cookie.serialize('token', 'admin', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
    }));
    return res.status(200).json({ message: 'Login berhasil' });
  }

  return res.status(401).json({ message: 'Email atau password salah' });
}
