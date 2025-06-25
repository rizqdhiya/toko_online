// pages/api/upload.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const uploadDir = path.join(process.cwd(), '/public/uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = new IncomingForm({ uploadDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: 'Gagal upload file' });
    }
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const fileName = path.basename(file.filepath || file.path);
    const url = `/uploads/${fileName}`;
    return res.status(200).json({ url });
  });
}