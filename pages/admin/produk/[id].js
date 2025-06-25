import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function EditProduk() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    nama: '',
    harga: 0,
    gambar: '',
    deskripsi: '',
    kategori: '',
    stok: 0
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/produk/${id}`)
        .then(res => res.json())
        .then(data => {
          // Handle null values from database
          setForm({
            nama: data.nama || '',
            harga: data.harga || 0,
            gambar: data.gambar || '',
            deskripsi: data.deskripsi || '',
            kategori: data.kategori || '',
            stok: data.stok || 0
          });
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('gambar', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setForm({ ...form, gambar: data.filename });
    } catch (error) {
      alert('Gagal mengupload gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/produk/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) throw new Error('Gagal mengupdate produk');
      
      router.push('/admin/produk');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Produk</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama Produk"
              className="w-full border p-2"
              required
            />
            <input
              name="harga"
              type="number"
              value={form.harga}
              onChange={handleChange}
              placeholder="Harga"
              className="w-full border p-2"
              required
            />
            
            <div className="space-y-2">
              <label className="block font-medium">Gambar Produk</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full border p-2"
                disabled={isUploading}
              />
              {form.gambar && (
                <div className="mt-2">
                  <img 
                    src={form.gambar} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({...form, gambar: ''})}
                    className="mt-1 text-red-600 text-sm"
                  >
                    Hapus Gambar
                  </button>
                </div>
              )}
              {isUploading && <p className="text-gray-500">Mengupload gambar...</p>}
            </div>

            <input
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              placeholder="Kategori"
              className="w-full border p-2"
            />
            <input
              name="stok"
              type="number"
              value={form.stok}
              onChange={handleChange}
              placeholder="Stok"
              className="w-full border p-2"
            />
          </div>
          <div>
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
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={isUploading}
        >
          {isUploading ? 'Menyimpan...' : 'Update'}
        </button>
      </form>
    </div>
  );
}