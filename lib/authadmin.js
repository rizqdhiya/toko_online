import db from './db';

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
