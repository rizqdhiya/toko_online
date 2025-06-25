import { useState } from 'react';
import { useRouter } from 'next/router';

export default function TambahProduk() {
  const [form, setForm] = useState({
    nama: '',
    harga: 0,
    gambar: '',
    deskripsi: '',
    kategori: '',
    stok: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewKategori, setShowNewKategori] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('file', file); // GANTI 'gambar' jadi 'file'

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload gagal');
      setForm({ ...form, gambar: data.url }); // GANTI data.filename jadi data.url
    } catch (error) {
      setError('Gagal mengupload gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/produk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menambah produk');
      setSuccess('Produk berhasil ditambahkan!');
      setTimeout(() => {
        router.push('/admin/produk');
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Tambah Produk</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Nama Produk</label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Nama Produk"
                className="w-full border p-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Harga</label>
              <input
                name="harga"
                type="number"
                value={form.harga}
                onChange={handleChange}
                placeholder="Harga"
                className="w-full border p-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Gambar Produk</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full border p-2"
                disabled={isUploading}
              />
              {form.gambar && (
                <img
                  src={form.gambar}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover border"
                />
              )}
              {isUploading && <p className="text-gray-500">Mengupload gambar...</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Kategori</label>
              <select
                name="kategori"
                value={form.kategori}
                onChange={e => {
                  if (e.target.value === "__new") {
                    setShowNewKategori(true);
                  } else {
                    setForm({ ...form, kategori: e.target.value });
                    setShowNewKategori(false);
                  }
                }}
                className="w-full border p-2"
              >
                <option value="">Pilih Kategori</option>
                <option value="Gamis">Gamis</option>
                <option value="Baju Anak">Baju Anak</option>
                <option value="Hem">Hem</option>
                <option value="Daster">Daster</option>
                <option value="__new">+ Tambah Kategori Baru</option>
              </select>
              {showNewKategori && (
                <input
                  type="text"
                  className="w-full border p-2 mt-2"
                  placeholder="Kategori baru"
                  value={form.kategori}
                  onChange={e => setForm({ ...form, kategori: e.target.value })}
                />
              )}
            </div>
            <div>
              <label className="block font-medium mb-1">Stok</label>
              <input
                name="stok"
                type="number"
                value={form.stok}
                onChange={handleChange}
                placeholder="Stok"
                className="w-full border p-2"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Deskripsi Produk</label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Deskripsi Produk"
              className="w-full border p-2 h-48"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isUploading || isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}