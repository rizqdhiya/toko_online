import db from '@/lib/db';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  // Ambil token dari cookie
  const { token, userId } = cookie.parse(req.headers.cookie || '');
  if (!token || !userId) {
    return res.status(401).json({ error: "Belum login" });
  }

  // GET: Ambil isi keranjang
  if (req.method === 'GET') {
    try {
      const [items] = await db.query(`
        SELECT 
          cart_items.*,
          produk.nama,
          produk.harga,
          produk.gambar
        FROM cart_items
        JOIN produk ON cart_items.product_id = produk.id
        WHERE user_id = ?
      `, [userId]);

      return res.status(200).json(items);
    } catch (error) {
      console.error('Cart error:', error);
      return res.status(500).json({ error: 'Gagal mengambil keranjang' });
    }
  }

  // POST: Tambah item ke keranjang
  if (req.method === 'POST') {
    const { product_id, quantity } = req.body;

    try {
      const [product] = await db.query('SELECT stok FROM produk WHERE id = ?', [product_id]);
      if (product[0].stok < quantity) {
        return res.status(400).json({ error: 'Stok tidak mencukupi' });
      }

      const [existingItem] = await db.query(
        'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, product_id]
      );

      if (existingItem.length > 0) {
        await db.query(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
          [quantity, existingItem[0].id]
        );
      } else {
        await db.query(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, product_id, quantity]
        );
      }

      return res.status(200).json({ message: 'Produk ditambahkan ke keranjang' });
    } catch (error) {
      console.error('Add to cart error:', error);
      return res.status(500).json({ error: 'Gagal menambahkan ke keranjang' });
    }
  }

  // DELETE: Hapus semua keranjang
  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
      return res.status(200).json({ message: 'Semua produk di keranjang dihapus' });
    } catch (error) {
      console.error('Delete cart error:', error);
      return res.status(500).json({ error: 'Gagal menghapus keranjang' });
    }
  }

  return res.status(405).end();
}