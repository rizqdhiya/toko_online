import db from '@/lib/db';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const userId = cookies.userId;

  // Pastikan pengguna sudah login untuk mengakses keranjang
  if (!userId) {
    return res.status(401).json({ error: "Belum login" });
  }

  // METHOD GET: Mengambil semua isi keranjang untuk pengguna yang sedang login
  if (req.method === 'GET') {
    try {
      // Query ini mengambil item dari keranjang dan menggabungkannya dengan tabel produk
      // serta varian untuk mendapatkan detail lengkap.
      const [items] = await db.query(`
        SELECT
          ci.id,
          ci.product_id,
          ci.variant_id,
          ci.quantity,
          p.nama,
          p.harga,
          p.gambar,
          IF(ci.variant_id IS NOT NULL, pv.stok, p.stok) AS stok,
          pv.warna AS variant_nama
        FROM cart_items ci
        JOIN produk p ON ci.product_id = p.id
        LEFT JOIN product_variants pv ON ci.variant_id = pv.id
        WHERE ci.user_id = ?
        ORDER BY ci.created_at DESC
      `, [userId]);

      return res.status(200).json(items);
    } catch (error) {
      console.error('API Cart GET Error:', error);
      return res.status(500).json({ error: 'Gagal mengambil data keranjang' });
    }
  }

  // METHOD POST: Menambahkan produk (beserta varian jika ada) ke keranjang
  if (req.method === 'POST') {
    const { product_id, quantity, variant_id } = req.body;

    try {
      let stokTersedia;
      // Cek ketersediaan stok, baik dari tabel varian atau tabel produk utama.
      if (variant_id) {
        const [[variant]] = await db.query('SELECT stok FROM product_variants WHERE id = ?', [variant_id]);
        stokTersedia = variant ? variant.stok : 0;
      } else {
        const [[product]] = await db.query('SELECT stok FROM produk WHERE id = ?', [product_id]);
        stokTersedia = product ? product.stok : 0;
      }

      if (stokTersedia < quantity) {
        return res.status(400).json({ error: 'Stok produk tidak mencukupi' });
      }

      // Cek apakah produk dengan varian yang sama sudah ada di keranjang.
      const [existingRows] = await db.query(
        'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND (variant_id <=> ?)',
        [userId, product_id, variant_id || null]
      );
      const existingItem = existingRows[0];

      if (existingItem) {
        // Jika sudah ada, cukup perbarui jumlahnya.
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > stokTersedia) {
            return res.status(400).json({ error: 'Jumlah di keranjang melebihi stok yang tersedia.' });
        }
        await db.query(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [newQuantity, existingItem.id]
        );
      } else {
        // Jika belum ada, tambahkan sebagai item baru di keranjang.
        await db.query(
          'INSERT INTO cart_items (user_id, product_id, quantity, variant_id) VALUES (?, ?, ?, ?)',
          [userId, product_id, quantity, variant_id || null]
        );
      }
      return res.status(200).json({ message: 'Produk berhasil ditambahkan ke keranjang' });
    } catch (error) {
        console.error('API Cart POST Error:', error);
        return res.status(500).json({ error: 'Gagal menambahkan produk ke keranjang' });
    }
  }

  // METHOD DELETE: Mengosongkan seluruh isi keranjang
  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
      return res.status(200).json({ message: 'Semua produk di keranjang berhasil dihapus' });
    } catch (error) {
      console.error('API Cart DELETE Error:', error);
      return res.status(500).json({ error: 'Gagal menghapus keranjang' });
    }
  }
  
  // Jika method bukan GET, POST, atau DELETE
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}