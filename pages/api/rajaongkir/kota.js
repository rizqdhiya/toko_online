export default async function handler(req, res) {
  const apiKey = process.env.RAJAONGKIR_API_KEY;
  const { provinsi } = req.query;
  let url = 'https://rajaongkir.komerce.id/api/v1/destination/city';
  if (provinsi) url += `?province=${provinsi}`;
  const fetchRes = await fetch(url, { headers: { key: apiKey } });
  const data = await fetchRes.json();
  res.json(data);
}