// lib/auth.js
import * as cookie from 'cookie';

export function withAuth(handler) {
  return async (req, res) => {
    const { token } = cookie.parse(req.headers.cookie || '');

    if (token !== 'admin') {
      return res.writeHead(302, { Location: '/login' }).end();
    }

    return handler(req, res);
  };
}
