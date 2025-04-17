import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan Password wajib diisi" });
  }

  try {
    console.log("Cari user berdasarkan email...");

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const user = users[0];

    console.log("User ditemukan:", user);

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Password salah" });
    }
    
      
    console.log("Password cocok. Membuat token...");

    const token = jwt.sign({ userId: user.id, nama: user.nama }, "secret-key", {
      expiresIn: "1h",
    });

    console.log("Token berhasil dibuat:", token);

    res.status(200).json({ message: "Login berhasil", nama: user.nama, token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login gagal", error: err.message });
  }
}
