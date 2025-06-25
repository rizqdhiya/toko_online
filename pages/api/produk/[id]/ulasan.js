import db from '@/lib/db';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  const { id } = req.query;
  const { userId } = cookie.parse(req.headers.cookie || '');

  if (req.method === 'POST') {
    const { ulasan, rating, order_id } = req.body;
    // Cek apakah sudah ada ulasan user untuk produk & order ini
    const [cek] = await db.query(
      'SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ? AND order_id = ?',
      [id, userId, order_id]
    );
    if (cek.length > 0) {
      // Sudah ada, update saja
      await db.query(
        'UPDATE product_reviews SET ulasan = ?, rating = ? WHERE id = ?',
        [ulasan, rating, cek[0].id]
      );
      return res.status(200).json({ message: 'Ulasan berhasil diupdate' });
    } else {
      // Belum ada, insert baru
      await db.query(
        'INSERT INTO product_reviews (product_id, user_id, order_id, ulasan, rating, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [id, userId, order_id, ulasan, rating]
      );
      return res.status(200).json({ message: 'Ulasan berhasil dikirim' });
    }
  } else if (req.method === 'GET') {
    const [rows] = await db.query(
      'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC',
      [id]
    );
    return res.status(200).json(rows);
  }

  res.status(405).end();
}