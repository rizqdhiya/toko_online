import db from '@/lib/db';

export default async function handler(req, res) {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS hasil');
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
