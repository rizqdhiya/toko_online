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
  const [variants, setVariants] = useState([]);

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
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload gagal');
      setForm({ ...form, gambar: data.url });
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
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      // Kirim data varian (tanpa gambar)
      formData.append('variants', JSON.stringify(variants.map(v => ({
        warna: v.warna,
        stok: v.stok,
        images: v.images // array of URL
      }))));
      // Kirim gambar per varian
      variants.forEach((v, idx) => {
        if (v.images && v.images.length > 0) {
          Array.from(v.images).forEach((file, i) => {
            formData.append(`variant_images_${idx}[]`, file);
          });
        }
      });

      const response = await fetch('/api/produk', {
        method: 'POST',
        body: formData,
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

  const handleAddVariant = () => {
    setVariants([...variants, { warna: '', stok: 0, images: [], previews: [] }]);
  };

  const handleRemoveVariant = (idx) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (idx, field, value) => {
    const newVariants = [...variants];
    newVariants[idx][field] = value;
    setVariants(newVariants);
  };

  const handleVariantImages = async (idx, files) => {
    const newVariants = [...variants];
    newVariants[idx].previews = [];
    newVariants[idx].images = [];
    for (const file of files) {
      // Upload ke Supabase via /api/upload
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        newVariants[idx].images.push(data.url); // Simpan URL, bukan file
        newVariants[idx].previews.push(data.url);
      }
    }
    setVariants(newVariants);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-8">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Tambah Produk Baru</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
              {success && <div className="text-green-500 text-sm mb-4">{success}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama Produk</label>
                    <input
                      type="text"
                      name="nama"
                      id="nama"
                      value={form.nama}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="harga" className="block text-sm font-medium text-gray-700">Harga</label>
                    <input
                      type="number"
                      name="harga"
                      id="harga"
                      value={form.harga}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gambar" className="block text-sm font-medium text-gray-700">Gambar Produk</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      id="gambar"
                      disabled={isUploading}
                    />
                    {form.gambar && (
                      <img
                        src={form.gambar}
                        alt="Preview"
                        className="mt-2 w-20 h-20 object-cover border rounded"
                      />
                    )}
                    {isUploading && <p className="text-gray-500 text-sm mt-1">Mengupload gambar...</p>}
                  </div>
                  <div>
                    <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select
                      name="kategori"
                      id="kategori"
                      value={form.kategori}
                      onChange={e => {
                        if (e.target.value === "__new") {
                          setShowNewKategori(true);
                        } else {
                          setForm({ ...form, kategori: e.target.value });
                          setShowNewKategori(false);
                        }
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Kategori baru"
                        value={form.kategori}
                        onChange={e => setForm({ ...form, kategori: e.target.value })}
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor="stok" className="block text-sm font-medium text-gray-700">Stok</label>
                    <input
                      type="number"
                      name="stok"
                      id="stok"
                      value={form.stok}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi Produk</label>
                  <textarea
                    name="deskripsi"
                    id="deskripsi"
                    value={form.deskripsi}
                    onChange={handleChange}
                    rows={5}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Variants</h2>
                {variants.map((variant, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-md shadow-sm mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Warna</label>
                        <input
                          type="text"
                          value={variant.warna}
                          onChange={e => handleVariantChange(idx, 'warna', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stok</label>
                        <input
                          type="number"
                          value={variant.stok}
                          onChange={e => handleVariantChange(idx, 'stok', Number(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gambar</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleVariantImages(idx, e.target.files)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          multiple
                        />
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {variant.previews.map((preview, i) => (
                            <div key={i} className="w-full h-20 relative">
                              <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-md" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Hapus Variant
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Tambah Variant
                </button>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={isUploading || isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
