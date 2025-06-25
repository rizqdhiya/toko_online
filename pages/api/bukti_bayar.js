import db from '@/lib/db';

export default async function handler(req, res) {
  const { orderId } = req.query;
  if (req.method === 'PUT') {
    const { bukti_bayar } = req.body;
    await db.query(
      'UPDATE orders SET bukti_bayar = ?, status = ? WHERE id = ?',
      [bukti_bayar, 'menunggu_konfirmasi', orderId]
    );
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    return res.status(200).json({ message: 'Bukti bayar diterima' });
  }
  res.status(405).end();
}