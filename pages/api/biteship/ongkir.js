// pages/api/biteship/ongkir.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { destination_area_id, weight, couriers } = req.body;
      const apiKey = process.env.BITESHIP_API_KEY;
  
      const origin_area_id = "IDNP3324020"; // Origin: Boja, Kendal
  
      // Kita buat objek request body untuk di-log
      const requestBody = {
        origin_area_id,
        destination_area_id,
        couriers,
        items: [{
          name: "Paket Toko Baju",
          description: "Pakaian",
          value: 100000,
          weight: weight,
          height: 10,
          width: 20,
          length: 20,
        }]
      };
  
      // --- DEBUGGING DIMULAI DI SINI ---
      console.log("==============================================");
      console.log("MENGIRIM REQUEST KE BITESHIP DENGAN DATA:");
      console.log(JSON.stringify(requestBody, null, 2)); // Mencetak request body dengan format rapi
      console.log("==============================================");
      // --- AKHIR DEBUGGING ---
  
      const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
  
      const data = await response.json();
  
      // --- DEBUGGING RESPON DARI BITESHIP ---
      console.log("==============================================");
      console.log("MENERIMA RESPON DARI BITESHIP:");
      console.log(JSON.stringify(data, null, 2)); // Mencetak respons dengan format rapi
      console.log("==============================================");
      // --- AKHIR DEBUGGING RESPON ---
  
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghitung ongkir');
      }
      
      res.status(200).json(data.pricing || []);
  
    } catch (error) {
      console.error('Biteship Ongkir Error:', error);
      res.status(500).json({ error: 'Gagal menghitung ongkir', details: error.message });
    }
  }