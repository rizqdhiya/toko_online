// pages/api/biteship/search-area.js

export default async function handler(req, res) {
    const { q } = req.query;
  
    if (!q) {
      return res.status(400).json({ error: 'Query pencarian "q" dibutuhkan' });
    }
  
    try {
      const apiKey = process.env.BITESHIP_API_KEY;
      // Kita cari berdasarkan semua level (kota, kecamatan, kelurahan)
      const url = `https://api.biteship.com/v1/maps/areas?countries=ID&input=${q}`;
  
      const response = await fetch(url, {
        headers: { 'Authorization': apiKey }
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengambil data dari Biteship API');
      
      // Format data agar cocok untuk react-select: { value, label }
      const formattedData = data.areas.map(area => ({
        value: area.id,
        label: `${area.administrative_division_level_3_name}, ${area.administrative_division_level_2_name}, ${area.administrative_division_level_1_name}`,
        // Kita simpan data lengkapnya jika perlu nanti
        ...area 
      }));
      
      res.status(200).json(formattedData);
  
    } catch (error) {
      console.error('Biteship Search Area Error:', error);
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  }