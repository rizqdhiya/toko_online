import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Ambil semua order, join user untuk info nama/email (opsional)
    const [orders] = await db.query(`
      SELECT o.id, o.user_id, u.nama, u.email, o.total, o.status, o.bukti_bayar, o.created_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    return res.status(200).json(orders);
  }
  res.status(405).end();
}