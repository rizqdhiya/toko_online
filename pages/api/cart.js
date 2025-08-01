// pages/api/cart.js
import db from '@/lib/db';
import * as cookie from 'cookie';

// Langsung gunakan db.query karena sudah mendukung promise
// Tidak perlu lagi 'promisify'

export default async function handler(req, res) {
  // Ambil token dari cookie
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;
  const userId = cookies.userId;

  if (!token || !userId) {
    return res.status(401).json({ error: "Belum login" });
  }

  // GET: Ambil isi keranjang
  if (req.method === 'GET') {
    try {
      // Hapus 'produk.berat' dari query SELECT
      const [items] = await db.query(`
        SELECT
          cart_items.id,
          cart_items.product_id,
          cart_items.quantity,
          produk.nama,
          produk.harga,
          produk.gambar,
          produk.stok
        FROM cart_items
        JOIN produk ON cart_items.product_id = produk.id
        WHERE user_id = ?
      `, [userId]);

      return res.status(200).json(items);
    } catch (error) {
      console.error('API Cart GET Error:', error);
      return res.status(500).json({ error: 'Gagal mengambil data keranjang' });
    }
  }

  // POST: Tambah item ke keranjang
  if (req.method === 'POST') {
    const { product_id, quantity } = req.body;
    try {
      const [[product]] = await db.query('SELECT stok FROM produk WHERE id = ?', [product_id]);
      if (!product || product.stok < quantity) {
        return res.status(400).json({ error: 'Stok produk tidak mencukupi' });
      }

      const [[existingItem]] = await db.query(
        'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, product_id]
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stok) {
            return res.status(400).json({ error: 'Jumlah di keranjang melebihi stok yang tersedia.' });
        }
        await db.query(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [newQuantity, existingItem.id]
        );
      } else {
        await db.query(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, product_id, quantity]
        );
      }
      return res.status(200).json({ message: 'Produk berhasil ditambahkan ke keranjang' });
    } catch (error) {
        console.error('API Cart POST Error:', error);
        return res.status(500).json({ error: 'Gagal menambahkan produk ke keranjang' });
    }
  }

  // DELETE: Hapus semua keranjang
  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
      return res.status(200).json({ message: 'Semua produk di keranjang berhasil dihapus' });
    } catch (error) {
      console.error('API Cart DELETE Error:', error);
      return res.status(500).json({ error: 'Gagal menghapus keranjang' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}