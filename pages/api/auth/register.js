import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nama, email, password, alamat } = req.body;

  if (!nama || !email || !password || !alamat) {
    return res.status(400).json({ message: 'Isi semua data' });
  }

  try {
    const [cek] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (cek.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (nama, email, password, alamat) VALUES (?, ?, ?, ?)',
      [nama, email, hashed, alamat]
    );

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal register', error: err.message });
  }
}
