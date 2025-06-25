import db from '@/lib/db';

export default async function handler(req, res) {
  const { orderId } = req.query;
  if (req.method === 'PUT') {
    const { batal, alasan } = req.body || {};
    if (batal) {
      await db.query(
        'UPDATE orders SET status = ?, alasan_batal = ? WHERE id = ?',
        ['batal', alasan || null, orderId]
      );
      return res.status(200).json({ message: 'Pesanan dibatalkan' });
    } else {
      await db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['diproses', orderId]
      );
      return res.status(200).json({ message: 'Pesanan diproses' });
    }
  }
  res.status(405).end();
}