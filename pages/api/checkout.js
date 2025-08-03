import db from '../../lib/db';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const userId = cookies.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Anda harus login untuk checkout' });
    }

    const {
      items, total, alamat, kota_nama, ongkir, layanan_ongkir
    } = req.body;

    if (!items || items.length === 0 || !total || !alamat || !kota_nama || ongkir === undefined) {
      return res.status(400).json({ error: 'Data tidak lengkap untuk checkout' });
    }

    const fullAlamat = `${alamat}, ${kota_nama}`;
    const areaParts = kota_nama.split(', ');
    const dbKotaNama = areaParts.length > 1 ? areaParts[1] : kota_nama;
    const dbProvinsiNama = areaParts.length > 2 ? areaParts[2] : '';

    // Buat pesanan baru di tabel `orders`
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total, alamat, kota_nama, provinsi_nama, ongkir, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [userId, total, fullAlamat, dbKotaNama, dbProvinsiNama, ongkir, 'menunggu_pembayaran']
    );

    const orderId = orderResult.insertId;

    // Siapkan data item untuk dimasukkan ke `order_items`, termasuk data varian
    const orderItems = items.map(item => [
      orderId,
      item.product_id,
      item.quantity,
      item.harga,
      item.nama,
      item.variant_id || null,      // Simpan ID Varian
      item.variant_nama || null    // Simpan Nama Varian
    ]);

    // Masukkan semua item pesanan ke tabel `order_items`
    await db.query(
      'INSERT INTO order_items (order_id, produk_id, qty, harga, nama, variant_id, variant_nama) VALUES ?',
      [orderItems]
    );

    // Kurangi stok produk, baik dari produk utama maupun dari varian
    for (const item of items) {
       if(item.variant_id) {
         await db.query('UPDATE product_variants SET stok = stok - ? WHERE id = ?', [item.quantity, item.variant_id]);
       } else {
         await db.query('UPDATE produk SET stok = stok - ? WHERE id = ?', [item.quantity, item.product_id]);
       }
    }
    
    // Kosongkan keranjang pengguna setelah checkout berhasil
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    res.status(200).json({ success: true, orderId: orderId });

  } catch (error) {
    console.error('Checkout API error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.', details: error.message || error });
  }
}