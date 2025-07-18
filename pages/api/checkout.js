import db from '@/lib/db';
import * as cookie from 'cookie';
import fetch from 'node-fetch'; // jika belum ada

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const { token, userId } = cookie.parse(req.headers.cookie || '');
  if (!token || !userId) {
    return res.status(401).json({ error: 'Belum login' });
  }
  const { items, total, alamat, kota_id, ongkir, provinsi_id } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Keranjang kosong' });
  }
  console.log('ITEMS CHECKOUT:', items);
  // Ambil nama kota & provinsi dari RajaOngkir
  const kotaRes = await fetch(`https://api.rajaongkir.com/starter/city?id=${kota_id}`, {
    headers: { key: process.env.RAJAONGKIR_API_KEY }
  });
  const kotaData = await kotaRes.json();
  const kotaResult = Array.isArray(kotaData.rajaongkir.results)
    ? kotaData.rajaongkir.results[0]
    : kotaData.rajaongkir.results;

  const kotaNama = kotaResult.city_name;
  const provinsiNama = kotaResult.province;

  const [orderResult] = await db.query(
    'INSERT INTO orders (user_id, total, alamat, kota_id, ongkir, kota_nama, provinsi_nama, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)',
    [userId, total, alamat, kota_id, ongkir, kotaNama, provinsiNama, 'menunggu_pembayaran']
  );
  const orderId = orderResult.insertId;
  for (const item of items) {
    const produkId = item.produk_id ?? item.product_id;
    const qty = item.qty ?? item.quantity;
    await db.query(
      'INSERT INTO order_items (order_id, produk_id, nama, harga, qty) VALUES (?, ?, ?, ?, ?)',
      [orderId, produkId, item.nama, item.harga, qty]
    );
    await db.query(
      'UPDATE produk SET stok = stok - ? WHERE id = ?',
      [qty, produkId]
    );
  }
 
  return res.status(200).json({ message: 'Checkout berhasil', orderId });
}