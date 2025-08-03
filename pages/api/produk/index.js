import { IncomingForm } from 'formidable';
import db from '@/lib/db';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // GET produk (publik, support search dan kategori)
  if (req.method === 'GET') {
    try {
      const { search = '', kategori = '' } = req.query;
      let query = 'SELECT id, nama, harga, gambar, kategori, stok FROM produk WHERE 1=1';
      const params = [];

      if (kategori) {
        query += ' AND kategori = ?';
        params.push(kategori);
      }

      if (search) {
        query += ' AND nama LIKE ?';
        params.push(`%${search}%`);
      }
      
      if (req.query.random) {
          const limit = Number(req.query.limit) || 4;
          const [rows] = await db.query(
            `SELECT id, nama, harga, gambar FROM produk ORDER BY RAND() LIMIT ?`, [limit]
          );
          return res.status(200).json(rows);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await db.query(query, params);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
  }

  // POST produk (khusus admin)
  if (req.method === 'POST') {
    const form = new IncomingForm();
    form.multiples = true;
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: 'Gagal parsing data' });

      try {
        // Simpan produk utama
        const { nama, harga, gambar, deskripsi, kategori, stok } = fields;
        const [result] = await db.query(
          `INSERT INTO produk (nama, harga, gambar, deskripsi, kategori, stok)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [nama, harga, gambar, deskripsi || null, kategori || null, stok || 0]
        );
        const productId = result.insertId;

        // Simpan variants (jika ada)
        let variants = [];
        if (fields.variants) {
          variants = JSON.parse(fields.variants);
          for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            const [resVar] = await db.query(
              'INSERT INTO product_variants (product_id, warna, stok) VALUES (?, ?, ?)',
              [productId, v.warna, v.stok]
            );
            variants[i].id = resVar.insertId;

            // SIMPAN GAMBAR VARIAN DARI URL (HASIL UPLOAD SUPABASE)
            if (Array.isArray(v.images)) {
              for (const url of v.images) {
                await db.query(
                  'INSERT INTO product_images (product_id, variant_id, url) VALUES (?, ?, ?)',
                  [productId, resVar.insertId, url]
                );
              }
            }
          }
        }

        // Simpan gambar utama (jika ada)
        if (gambar) {
          await db.query(
            'INSERT INTO product_images (product_id, variant_id, url) VALUES (?, NULL, ?)',
            [productId, gambar]
          );
        }

        res.status(201).json({ message: 'Produk berhasil ditambahkan', id: productId });
      } catch (error) {
        res.status(500).json({ error: 'Gagal menambah produk', detail: error.message });
      }
    });
    return;
  }

  // Method lain
  return res.status(405).end();
}