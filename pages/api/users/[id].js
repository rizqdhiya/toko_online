// pages/api/users/[id].js
import db from '@/lib/db';
import { withAdminAuth } from '@/lib/authadmin';
import bcrypt from 'bcryptjs';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const [rows] = await db.query(
      'SELECT id, nama, email, alamat, no_hp FROM users WHERE id = ?', 
      [id]
    );
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'PUT') {
    try {
      const { nama, email, alamat, no_hp, password } = req.body;
      
      let updates = [];
      let params = [];
      
      // Build dynamic query
      if (nama) {
        updates.push('nama = ?');
        params.push(nama);
      }
      if (email) {
        updates.push('email = ?');
        params.push(email);
      }
      if (alamat !== undefined) {
        updates.push('alamat = ?');
        params.push(alamat);
      }
      if (no_hp !== undefined) {
        updates.push('no_hp = ?');
        params.push(no_hp);
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10); // bcryptjs is async
        updates.push('password = ?');
        params.push(hashedPassword);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'Tidak ada data yang diubah' });
      }
      
      params.push(id);
      
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await db.query(query, params);
      
      return res.status(200).json({ message: 'User berhasil diperbarui' });
      
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM users WHERE id = ?', [id]);
      return res.status(200).json({ message: 'User berhasil dihapus' });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).end();
}

export default withAdminAuth(handler);