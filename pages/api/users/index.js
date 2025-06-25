import db from '@/lib/db';
import { withAdminAuth } from '@/lib/authadmin'; // Ganti ke middleware admin
import bcrypt from 'bcrypt';

async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT id, nama, email, alamat, created_at FROM users');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    try {
      const { nama, email, password, alamat } = req.body;
      
      // Validasi input
      if (!nama || !email || !password) {
        return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert ke database
      const [result] = await db.query(
        'INSERT INTO users (nama, email, password, alamat) VALUES (?, ?, ?, ?)',
        [nama, email, hashedPassword, alamat]
      );
      
      return res.status(201).json({
        message: 'User berhasil ditambahkan',
        id: result.insertId
      });
      
    } catch (error) {
      // Handle duplicate email error
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email sudah terdaftar' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).end();
}

export default withAdminAuth(handler); // Ganti dari withAuth ke withAdminAuth