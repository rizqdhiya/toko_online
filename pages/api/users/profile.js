import db from '@/lib/db';
import * as cookie from 'cookie';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { token, userId } = cookie.parse(req.headers.cookie || '');
    if (!token || !userId) {
      return res.status(401).json({ error: "Belum login" });
    }
    const { nama, alamat, foto, password, no_hp } = req.body;
    let updates = [];
    let params = [];

    if (nama) {
      updates.push('nama = ?');
      params.push(nama);
    }
    if (alamat !== undefined) {
      updates.push('alamat = ?');
      params.push(alamat);
    }
    if (foto) {
      updates.push('foto = ?');
      params.push(foto);
    }
    if (no_hp !== undefined) {
      updates.push('no_hp = ?');
      params.push(no_hp);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashed);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: "Tidak ada data yang diubah" });
    }
    params.push(userId);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    return res.status(200).json({ message: 'Profil diupdate' });
  } else if (req.method === 'GET') {
    const { token, userId } = cookie.parse(req.headers.cookie || '');
    if (!token || !userId) return res.status(401).json({ error: "Belum login" });
    const [rows] = await db.query('SELECT id, nama, email, alamat, foto, no_hp FROM users WHERE id = ?', [userId]);
    return res.status(200).json(rows[0]);
  }
  return res.status(405).end();
}