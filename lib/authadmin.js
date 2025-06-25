import db from './db';
import * as cookie from 'cookie';

export async function loginAdmin(email, password) {
  const [rows] = await db.query('SELECT * FROM admin_users WHERE email = ?', [email]);
  if (rows.length === 0) return null;

  const admin = rows[0];
  
  // Langsung cocokkan password
  if (admin.password === password) {
    return admin; // admin valid
  }
  
  return null; // password tidak cocok
}

export function withAdminAuth(handler) {
  return async (req, res) => {
    const { admin_token } = cookie.parse(req.headers.cookie || '');
    if (!admin_token) {
      return res.status(403).json({ error: 'Akses admin diperlukan' });
    }
    // Bisa tambahkan pengecekan id admin di database jika perlu
    return handler(req, res);
  };
}
