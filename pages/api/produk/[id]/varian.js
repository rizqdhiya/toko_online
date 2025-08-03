import db from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    // Ambil variasi
    const [variants] = await db.query(
      'SELECT id, warna, stok FROM product_variants WHERE product_id = ?',
      [id]
    );
    // Ambil gambar
    const [images] = await db.query(
      'SELECT id, url, variant_id FROM product_images WHERE product_id = ?',
      [id]
    );
    res.status(200).json({ variants, images });
  } catch (e) {
    res.status(500).json({ error: 'Gagal mengambil data varian' });
  }
}