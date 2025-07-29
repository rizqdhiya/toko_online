export default async function handler(req, res) {
  const apiKey = process.env.RAJAONGKIR_API_KEY;
  const fetchRes = await fetch('https://rajaongkir.komerce.id/api/v1/destination/province', {
    headers: { key: apiKey }
  });
  const data = await fetchRes.json();
  res.json(data);
}