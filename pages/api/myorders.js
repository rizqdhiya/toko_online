import db from '@/lib/db';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  const { userId } = cookie.parse(req.headers.cookie || '');
  if (!userId) return res.status(401).end();

  if (req.method === 'GET') {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT 
            oi.*, 
            oi.produk_id AS product_id, 
            COALESCE(p.nama, oi.nama) AS nama
         FROM order_items oi 
         LEFT JOIN produk p ON oi.produk_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    return res.status(200).json(orders);
  }

  res.status(405).end();
}