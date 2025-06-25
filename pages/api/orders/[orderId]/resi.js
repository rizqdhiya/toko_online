import db from '@/lib/db';

export default async function handler(req, res) {
  const { orderId } = req.query;
  if (req.method === 'PUT') {
    const { no_resi } = req.body;
    await db.query(
      'UPDATE orders SET status = ?, no_resi = ? WHERE id = ?',
      ['dikirim', no_resi, orderId]
    );
    return res.status(200).json({ message: 'Resi berhasil diinput' });
  }
  res.status(405).end();
}