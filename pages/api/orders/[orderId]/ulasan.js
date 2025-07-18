// pages/api/orders/[orderId]/ulasan.js
import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { orderId } = req.query;
    try {
      // FIX: Mengambil ulasan berdasarkan order_id, bukan product_id
      const [rows] = await db.query(
        `SELECT r.*, u.nama as user_nama 
         FROM product_reviews r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.order_id = ?`,
        [orderId]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching reviews by order:', error);
      return res.status(500).json({ error: 'Gagal mengambil data ulasan' });
    }
  }
  res.status(405).end();
}