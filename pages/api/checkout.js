import db from '@/lib/db';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const { token, userId } = cookie.parse(req.headers.cookie || '');
  if (!token || !userId) {
    return res.status(401).json({ error: 'Belum login' });
  }
  const { items, total, alamat, kota_id, ongkir } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Keranjang kosong' });
  }
  console.log('ITEMS CHECKOUT:', items);
  const [orderResult] = await db.query(
    'INSERT INTO orders (user_id, total, alamat, kota_id, ongkir, created_at, status) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
    [userId, total, alamat, kota_id, ongkir, 'menunggu_pembayaran']
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