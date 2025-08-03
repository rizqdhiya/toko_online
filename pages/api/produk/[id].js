// pages/api/produk/[id].js
import { IncomingForm } from 'formidable';
import db from '@/lib/db';
import fs from 'fs';

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
  
  // PUT: update produk (dan varian/gambar)
  if (req.method === 'PUT') {
    console.log('PUT /api/produk/[id] masuk');

    // Jika request JSON (bukan FormData)
    if (req.headers['content-type']?.includes('application/json')) {
      try {
        const fields = req.body;
        // Update produk utama
        const { nama, harga, gambar, deskripsi, kategori, stok } = fields;
        await db.query(
          `UPDATE produk SET nama=?, harga=?, gambar=?, deskripsi=?, kategori=?, stok=? WHERE id=?`,
          [nama, harga, gambar, deskripsi, kategori, stok, id]
        );
        console.log('Produk utama diupdate');

        // Hapus semua varian & gambar lama
        await db.query('DELETE FROM product_variants WHERE product_id=?', [id]);
        await db.query('DELETE FROM product_images WHERE product_id=?', [id]);
        console.log('Varian & gambar lama dihapus');

        // Simpan ulang variants & gambar
        let variants = [];
        if (fields.variants) {
          variants = fields.variants;
          for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            const [resVar] = await db.query(
              'INSERT INTO product_variants (product_id, warna, stok) VALUES (?, ?, ?)',
              [id, v.warna, v.stok]
            );
            variants[i].id = resVar.insertId;
            console.log(`Varian ${v.warna} disimpan dengan id ${resVar.insertId}`);

            // SIMPAN GAMBAR VARIAN DARI URL
            if (Array.isArray(v.images)) {
              for (const url of v.images) {
                await db.query(
                  'INSERT INTO product_images (product_id, variant_id, url) VALUES (?, ?, ?)',
                  [id, resVar.insertId, url]
                );
                console.log(`Gambar varian ${v.warna} disimpan: ${url}`);
              }
            }
          }
        }

        // Gambar utama
        if (gambar) {
          await db.query(
            'INSERT INTO product_images (product_id, variant_id, url) VALUES (?, NULL, ?)',
            [id, gambar]
          );
          console.log('Gambar utama disimpan:', gambar);
        }

        console.log('Selesai update produk');
        res.status(200).json({ message: 'Produk berhasil diupdate' });
      } catch (error) {
        console.error('Update produk error:', error);
        res.status(500).json({ error: 'Gagal update produk', detail: error.message });
      }
      return;
    }

    // Jika request FormData (upload file/gambar)
    const form = new IncomingForm();
    form.multiples = true;
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        return res.status(500).json({ error: 'Gagal parsing data' });
      }
      try {
        console.log('Fields:', fields);
        // Update produk utama
        const { nama, harga, gambar, deskripsi, kategori, stok } = fields;
        await db.query(
          `UPDATE produk SET nama=?, harga=?, gambar=?, deskripsi=?, kategori=?, stok=? WHERE id=?`,
          [nama, harga, gambar, deskripsi, kategori, stok, id]
        );
        console.log('Produk utama diupdate');

        // Hapus semua varian & gambar lama
        await db.query('DELETE FROM product_variants WHERE product_id=?', [id]);
        await db.query('DELETE FROM product_images WHERE product_id=?', [id]);
        console.log('Varian & gambar lama dihapus');

        // Simpan ulang variants & gambar
        let variants = [];
        if (fields.variants) {
          variants = JSON.parse(fields.variants);
          for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            const [resVar] = await db.query(
              'INSERT INTO product_variants (product_id, warna, stok) VALUES (?, ?, ?)',
              [id, v.warna, v.stok]
            );
            variants[i].id = resVar.insertId;
            console.log(`Varian ${v.warna} disimpan dengan id ${resVar.insertId}`);

            // SIMPAN GAMBAR VARIAN DARI URL
            if (Array.isArray(v.images)) {
              for (const url of v.images) {
                await db.query(
                  'INSERT INTO product_images (product_id, variant_id, url) VALUES (?, ?, ?)',
                  [id, resVar.insertId, url]
                );
                console.log(`Gambar varian ${v.warna} disimpan: ${url}`);
              }
            }
          }
        }

        // Simpan gambar per varian (file upload)
        for (let i = 0; i < variants.length; i++) {
          const filesKey = `variant_images_${i}[]`;
          let varFiles = files[filesKey];
          if (varFiles) {
            if (!Array.isArray(varFiles)) varFiles = [varFiles];
            for (const file of varFiles) {
              const fileName = Date.now() + '-' + file.originalFilename;
              const path = `./public/uploads/${fileName}`;
              fs.copyFileSync(file.filepath, path);
              await db.query(
                'INSERT INTO product_images (product_id, variant_id, url) VALUES (?, ?, ?)',
                [id, variants[i].id, `/uploads/${fileName}`]
              );
              console.log(`File gambar varian diupload: ${fileName}`);
            }
          }
        }

        // Gambar utama
        if (gambar) {
          await db.query(
            'INSERT INTO product_images (product_id, variant_id, url) VALUES (?, NULL, ?)',
            [id, gambar]
          );
          console.log('Gambar utama disimpan:', gambar);
        }

        console.log('Selesai update produk');
        res.status(200).json({ message: 'Produk berhasil diupdate' });
      } catch (error) {
        console.error('Update produk error:', error);
        res.status(500).json({ error: 'Gagal update produk', detail: error.message });
      }
    });
    return;
  }
  
  // PUT & DELETE hanya untuk admin (butuh auth)
  if (req.method === 'DELETE') {
    const { withAdminAuth } = await import('@/lib/authadmin');
    return withAdminAuth(async (req, res) => {
      if (req.method === 'DELETE') {
        try {
          // **[FIXED]** Hapus relasi di tabel `cart_items` terlebih dahulu
          await db.query('DELETE FROM cart_items WHERE product_id = ?', [id]);
          // Hapus relasi di tabel `product_reviews`
          await db.query('DELETE FROM product_reviews WHERE product_id = ?', [id]);
          // Hapus gambar produk terkait
          await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
          // Hapus varian produk terkait
          await db.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
          // Hapus produk utama
          await db.query('DELETE FROM produk WHERE id = ?', [id]);
          return res.status(204).end();
        } catch (error) {
          console.error('Error deleting product:', error);
          return res.status(500).json({ error: 'Gagal menghapus produk' });
        }
      }
    })(req, res);
  }

  return res.status(405).end();
}

export default handler;