import db from '@/lib/db';
import { withAdminAuth } from '@/lib/authadmin'; // gunakan middleware admin

async function handler(req, res) {
  // GET produk (publik, support search)
  if (req.method === 'GET') {
    try {
      const search = req.query.search || '';
      let rows;
      if (search) {
        const [result] = await db.query(
          `SELECT id, nama, harga, gambar, kategori, stok 
           FROM produk
           WHERE nama LIKE ?
           ORDER BY created_at DESC`,
          [`%${search}%`]
        );
        rows = result;
      } else {
        const [result] = await db.query(
          `SELECT id, nama, harga, gambar, kategori, stok 
           FROM produk
           ORDER BY created_at DESC`
        );
        rows = result;
      }
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
  }

  // POST produk (khusus admin)
  if (req.method === 'POST') {
    return withAdminAuth(async (req, res) => {
      try {
        const { nama, harga, gambar, deskripsi, kategori, stok } = req.body;
        const [result] = await db.query(
          `INSERT INTO produk (nama, harga, gambar, deskripsi, kategori, stok)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [nama, harga, gambar, deskripsi || null, kategori || null, stok || 0]
        );
        return res.status(201).json({
          message: 'Produk berhasil ditambahkan',
          id: result.insertId
        });
      } catch (error) {
        return res.status(500).json({ error: 'Gagal menambah produk' });
      }
    })(req, res);
  }

  // Method lain
  return res.status(405).end();
}

export default handler;