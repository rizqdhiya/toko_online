// pages/api/admin/login.js
import { loginAdmin } from '../../../lib/authadmin';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  const admin = await loginAdmin(email, password);

  if (!admin) return res.status(401).json({ error: 'Email atau password salah' });

  // Set cookie session untuk login
  res.setHeader('Set-Cookie', serialize('admin_token', String(admin.id), {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 hari
  }));

  res.status(200).json({ message: 'Login berhasil' });
}
