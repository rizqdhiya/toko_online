// pages/api/upload.js

import { IncomingForm } from 'formidable';
import fs from 'fs';
import { supabase } from '../../lib/supabaseClient'; // Pastikan path ini benar

// Menonaktifkan bodyParser bawaan Next.js agar formidable bisa bekerja
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    // 1. Cek jika ada error atau tidak ada file yang diupload
    if (err || !files.file) {
      console.error('Error parsing form:', err);
      return res.status(400).json({ error: 'Gagal memproses file upload.' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = file.filepath;
    const fileName = `${Date.now()}_${file.originalFilename}`;
    const bucketName = 'upload'; 

    try {
      // 2. Baca file yang diupload (yang disimpan sementara oleh formidable)
      const fileContent = fs.readFileSync(filePath);

      // 3. Upload file ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileContent, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }
      
      // 4. Dapatkan URL publik dari file yang baru diupload
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // 5. Kirim URL kembali sebagai respons
      return res.status(200).json({ url: publicUrl });

    } catch (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Gagal mengupload file ke storage.', details: error.message });
    }
  });
}