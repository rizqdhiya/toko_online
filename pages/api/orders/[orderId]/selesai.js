import db from '@/lib/db';

export default async function handler(req, res) {
  const { orderId } = req.query;
  if (req.method === 'PUT') {
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['selesai', orderId]
    );
    return res.status(200).json({ message: 'Pesanan selesai' });
  }
  res.status(405).end();
}