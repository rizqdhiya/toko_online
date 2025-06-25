export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.RAJAONGKIR_API_KEY;
  const { origin, destination, weight, courier } = req.body;
  const fetchRes = await fetch('https://api.rajaongkir.com/starter/cost', {
    method: 'POST',
    headers: {
      key: apiKey,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      origin,
      destination,
      weight,
      courier
    })
  });
  const data = await fetchRes.json();
  res.json(data);
}