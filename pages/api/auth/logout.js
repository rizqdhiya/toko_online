import * as cookie from "cookie";

export default function handler(req, res) {
  res.setHeader("Set-Cookie", [
    cookie.serialize("token", "", { path: "/", httpOnly: true, maxAge: -1 }),
    cookie.serialize("userId", "", { path: "/", httpOnly: true, maxAge: -1 }),
  ]);
  res.status(200).json({ message: "Logout berhasil" });
}