import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { orderId } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM product_reviews WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    return res.status(200).json(rows);
  }
  res.status(405).end();
}