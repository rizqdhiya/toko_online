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
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-8">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Edit Produk</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama Produk</label>
                  <input
                    type="text"
                    name="nama"
                    id="nama"
                    value={form.nama}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  <label htmlFor="harga" className="block text-sm font-medium text-gray-700">Harga</label>
                  <input
              type="number"
                    name="harga"
                    id="harga"
              value={form.harga}
              onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />

                  <div className="space-y-2">
                    <label htmlFor="gambar" className="block text-sm font-medium text-gray-700">Gambar Produk</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      id="gambar"
                      disabled={isUploading}
                    />
                    {form.gambar && (
                      <div className="mt-2 flex items-center space-x-4">
                        <img
                          src={form.gambar}
                          alt="Preview"
                          className="w-20 h-20 object-cover border rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, gambar: '' })}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded-md"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                    {isUploading && <p className="text-gray-500 text-sm">Mengupload gambar...</p>}
                  </div>

                  <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">Kategori</label>
                  <input
                    type="text"
                    name="kategori"
                    id="kategori"
              value={form.kategori}
              onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <label htmlFor="stok" className="block text-sm font-medium text-gray-700">Stok</label>
                  <input
              type="number"
                    name="stok"
                    id="stok"
              value={form.stok}
              onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi Produk</label>
                  <textarea
                    name="deskripsi"
                    id="deskripsi"
                    value={form.deskripsi}
                    onChange={handleChange}
                    rows={5}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isUploading}
              >
                {isUploading ? 'Menyimpan...' : 'Update Produk'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}