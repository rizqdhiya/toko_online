// pages/api/biteship/ongkir.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { destination_area_id, weight, couriers } = req.body;

  // Validasi input dasar
  if (!destination_area_id || !weight || !couriers) {
    return res.status(400).json({ success: false, error: 'Input tidak lengkap: destination_area_id, weight, dan couriers diperlukan.' });
  }

  // Siapkan item untuk request ke Biteship
  const items = [{
    name: 'Produk', // Nama produk bisa digeneralisasi
    description: 'Paket pesanan',
    value: 1000, // Nilai barang (opsional, bisa diisi nilai minimum)
    weight: Number(weight), // Pastikan weight adalah angka
    quantity: 1,
  }];

  try {
    const biteshipResponse = await fetch('https://api.biteship.com/v1/rates/couriers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pastikan Anda sudah mengatur BITESHP_API_KEY di .env.local
        'Authorization': process.env.BITESHIP_API_KEY,
      },
      body: JSON.stringify({
        // GANTI DENGAN ID AREA ASAL PENGIRIMAN TOKO ANDA
        origin_postal_code: 51381,
        destination_area_id,
        couriers,
        items,
      }),
    });

    const data = await biteshipResponse.json();

    if (!biteshipResponse.ok) {
      // Tangani error dari Biteship dengan lebih spesifik
      console.error('Biteship API Error:', data);
      const errorMessage = data.error || 'Gagal mengambil data ongkir dari Biteship.';
      return res.status(biteshipResponse.status).json({ success: false, error: errorMessage });
    }

    if (!data.success) {
      // Tangani jika Biteship mengembalikan success: false
      console.error('Biteship Request Failed:', data.error);
      return res.status(400).json({ success: false, error: data.error || "Biteship tidak dapat memproses permintaan." });
    }

    // Filter hanya layanan yang memiliki harga
    const availableRates = data.pricing.filter(rate => rate.price && rate.price > 0);

    return res.status(200).json(availableRates);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server saat mengecek ongkir.' });
  }
}