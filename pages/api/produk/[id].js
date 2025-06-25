// pages/api/produk/[id].js
import db from '@/lib/db';

async function handler(req, res) {
  const { id } = req.query;

  // GET detail produk (publik)
  if (req.method === 'GET') {
    try {
      const [rows] = await db.query(
        `SELECT * FROM produk WHERE id = ?`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Produk tidak ditemukan' });
      }
      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
  }

  // PUT & DELETE hanya untuk admin (butuh auth)
  if (req.method === 'PUT' || req.method === 'DELETE') {
    // Import dan panggil withAuth di sini
    const { withAuth } = await import('@/lib/auth');
    return withAuth(async (req, res) => {
      if (req.method === 'PUT') {
        try {
          const { nama, harga, gambar, deskripsi, kategori, stok } = req.body;
          await db.query(
            `UPDATE produk SET
            nama = ?, harga = ?, gambar = ?, deskripsi = ?, kategori = ?, stok = ?
            WHERE id = ?`,
            [nama, harga, gambar || null, deskripsi, kategori || null, stok, id]
          );
          return res.status(200).json({ message: 'Produk berhasil diperbarui' });
        } catch (error) {
          return res.status(500).json({ error: 'Gagal mengupdate produk' });
        }
      }
      if (req.method === 'DELETE') {
        await db.query('DELETE FROM produk WHERE id = ?', [id]);
        return res.status(200).json({ message: 'Produk berhasil dihapus' });
      }
    })(req, res);
  }

  return res.status(405).end();
}

export default handler;