import * as cookie from 'cookie';

export default function handler(req, res) {
  const { token } = cookie.parse(req.headers.cookie || '');

  if (token !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.status(200).json({ message: 'OK' });
}
