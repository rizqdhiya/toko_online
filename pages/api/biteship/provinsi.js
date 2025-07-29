// pages/api/biteship/provinsi.js
export default async function handler(req, res) {
    try {
      const apiKey = process.env.BITESHIP_API_KEY;
      // URL untuk mengambil semua area level 1 (provinsi) di Indonesia
      const url = 'https://api.biteship.com/v1/maps/areas?countries=ID&level=1';
  
      const response = await fetch(url, {
        headers: { 'Authorization': apiKey }
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengambil data provinsi');
  
      res.status(200).json(data.areas || []);
    } catch (error) {
      console.error('Biteship Provinsi Error:', error);
      res.status(500).json({ error: 'Gagal mengambil data provinsi' });
    }
  }