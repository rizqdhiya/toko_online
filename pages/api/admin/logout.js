// pages/api/admin/logout.js
import { serialize } from 'cookie';

export default function handler(req, res) {
  // Hapus cookie admin_token untuk logout
  res.setHeader('Set-Cookie', serialize('admin_token', '', {
    path: '/',
    httpOnly: true,
    maxAge: -1, // Menghapus cookie
  }));

  res.status(200).json({ message: 'Logout berhasil' });
}
