import db from '@/lib/db';

// Anda bisa menambahkan withAdminAuth jika endpoint ini khusus admin
// import { withAdminAuth } from '@/lib/authadmin';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 1. Ambil semua data pesanan utama
      const [orders] = await db.query(`
        SELECT 
          o.id, o.user_id, u.nama, u.email, u.no_hp, o.total, o.status, 
          o.bukti_bayar, o.created_at, o.alamat, o.kota_nama, o.provinsi_nama, 
          o.ongkir, o.no_resi, o.alasan_batal
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);

      // 2. Untuk setiap pesanan, ambil item-item yang terkait
      for (const order of orders) {
        const [items] = await db.query(
          `SELECT 
             oi.*, 
             p.gambar  -- Ambil URL gambar utama produk
           FROM order_items oi 
           LEFT JOIN produk p ON oi.produk_id = p.id 
           WHERE oi.order_id = ?`,
          [order.id]
        );
        // 3. Sisipkan data item ke dalam objek pesanan
        order.items = items;
      }

      return res.status(200).json(orders);

    } catch (error) {
      console.error("API Orders GET Error:", error);
      return res.status(500).json({ error: 'Gagal mengambil data pesanan' });
    }
  }
  
  res.setHeader('Allow', ['GET']);
  res.status(405).end();
}

// Jika endpoint ini memerlukan otentikasi admin, gunakan baris ini
// export default withAdminAuth(handler);
export default handler;