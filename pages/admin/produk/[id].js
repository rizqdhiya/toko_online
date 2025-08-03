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
  const [variants, setVariants] = useState([]); // [{id, warna, stok, images: [url], previews: [url]}]
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/produk/${id}/varian`)
        .then(res => res.json())
        .then(data => {
          setVariants(
            (data.variants || []).map(v => ({
              ...v,
              images: (data.images || []).filter(img => img.variant_id === v.id).map(img => img.url),
              previews: (data.images || []).filter(img => img.variant_id === v.id).map(img => img.url),
            }))
          );
        });
      fetch(`/api/produk/${id}`)
        .then(res => res.json())
        .then(data => setForm({
          nama: data.nama || '',
          harga: data.harga || 0,
          gambar: data.gambar || '',
          deskripsi: data.deskripsi || '',
          kategori: data.kategori || '',
          stok: data.stok || 0
        }));
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
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      setForm({ ...form, gambar: data.url });
    } finally {
      setIsUploading(false);
    }
  };

  const handleVariantImages = async (idx, files) => {
    const newVariants = [...variants];
    newVariants[idx].previews = [];
    newVariants[idx].images = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        newVariants[idx].images.push(data.url);
        newVariants[idx].previews.push(data.url);
      }
    }
    setVariants(newVariants);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = {
        ...form,
        variants: variants.map(v => ({
          id: v.id, // penting untuk update/hapus di backend
          warna: v.warna,
          stok: v.stok,
          images: v.images
        }))
      };
      const response = await fetch(`/api/produk/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Gagal mengupdate produk');
      router.push('/admin/produk');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
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
              <div>
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Variants</h2>
    {variants.map((variant, idx) => (
      <div key={variant.id || idx} className="bg-gray-50 p-4 rounded-md shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Warna</label>
            <input
              type="text"
              value={variant.warna}
              onChange={e => handleVariantChange(idx, 'warna', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stok</label>
            <input
              type="number"
              value={variant.stok}
              onChange={e => handleVariantChange(idx, 'stok', Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gambar</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleVariantImages(idx, e.target.files)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {variant.previews?.map((preview, i) => (
                <img key={i} src={preview} alt={`Preview ${i + 1}`} className="w-16 h-16 object-cover rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => handleRemoveVariant(idx)}
            className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
          >
            Hapus Variant
          </button>
        </div>
      </div>
    ))}
    <button
      type="button"
      onClick={handleAddVariant}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
    >
      Tambah Variant
    </button>
  </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                disabled={isUploading || isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Update Produk'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}