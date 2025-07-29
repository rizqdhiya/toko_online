// pages/api/biteship/kota.js
export default async function handler(req, res) {
    const { provinsi_id } = req.query; // contoh: /api/biteship/kota?provinsi_id=IDNP6
  
    if (!provinsi_id) {
      return res.status(400).json({ error: 'ID Provinsi dibutuhkan' });
    }
  
    try {
      const apiKey = process.env.BITESHIP_API_KEY;
      // URL untuk mengambil area level 2 (kota) berdasarkan ID provinsi sebagai parent
      const url = `https://api.biteship.com/v1/maps/areas?countries=ID&level=2&parent_id=${provinsi_id}`;
  
      const response = await fetch(url, {
        headers: { 'Authorization': apiKey }
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengambil data kota');
  
      res.status(200).json(data.areas || []);
    } catch (error) {
      console.error('Biteship Kota Error:', error);
      res.status(500).json({ error: 'Gagal mengambil data kota' });
    }
  }