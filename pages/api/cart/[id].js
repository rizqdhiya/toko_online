import db from '@/lib/db';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  const { id } = req.query;
  const { token, userId } = cookie.parse(req.headers.cookie || '');
  if (!token || !userId) {
    return res.status(401).json({ error: "Belum login" });
  }

  // DELETE: Hapus satu produk dari keranjang
  if (req.method === 'DELETE') {
    try {
      const [result] = await db.query(
        'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Produk tidak ditemukan di keranjang' });
      }
      return res.status(200).json({ message: 'Produk dihapus dari keranjang' });
    } catch (error) {
      console.error('Delete cart item error:', error);
      return res.status(500).json({ error: 'Gagal menghapus produk dari keranjang' });
    }
  }

  // PUT: Update qty produk di keranjang
  if (req.method === 'PUT') {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Jumlah tidak valid' });
    }
    try {
      const [result] = await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
        [quantity, id, userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Produk tidak ditemukan di keranjang' });
      }
      return res.status(200).json({ message: 'Jumlah produk diupdate' });
    } catch (error) {
      console.error('Update qty cart item error:', error);
      return res.status(500).json({ error: 'Gagal update jumlah produk' });
    }
  }

  return res.status(405).end();
}