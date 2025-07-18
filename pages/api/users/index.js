import db from '@/lib/db';
import { withAdminAuth } from '@/lib/authadmin';
import bcrypt from 'bcryptjs';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Menambahkan no_hp dan mengurutkan
    const [rows] = await db.query('SELECT id, nama, email, alamat, no_hp, created_at FROM users ORDER BY created_at DESC');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    try {
      // Menambahkan no_hp dari body
      const { nama, email, password, alamat, no_hp } = req.body;
      
      // Validasi input
      if (!nama || !email || !password || !no_hp) {
        return res.status(400).json({ error: 'Nama, email, password, dan No. HP wajib diisi' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert ke database
      const [result] = await db.query(
        'INSERT INTO users (nama, email, password, alamat, no_hp) VALUES (?, ?, ?, ?, ?)',
        [nama, email, hashedPassword, alamat, no_hp]
      );
      
      return res.status(201).json({
        message: 'User berhasil ditambahkan',
        id: result.insertId
      });
      
    } catch (error) {
      console.error("Error creating user:", error); // Logging error untuk debug
      // Handle duplicate email error
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email sudah terdaftar' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).end();
}

export default withAdminAuth(handler);