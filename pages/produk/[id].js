import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Layout from '@/components/Layout';
import AuthModal from '@/components/AuthModal';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [msg, setMsg] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const [ulasanList, setUlasanList] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/produk/${id}`);
        if (!response.ok) {
          throw new Error('Produk tidak ditemukan');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch ulasan produk
    const fetchUlasan = async () => {
      const res = await fetch(`/api/produk/${id}/ulasan`);
      if (res.ok) {
        const data = await res.json();
        setUlasanList(data);
        if (data.length > 0) {
          const avg = data.reduce((sum, u) => sum + u.rating, 0) / data.length;
          setAvgRating(avg);
        } else {
          setAvgRating(0);
        }
      }
    };

    fetchProduct();
    fetchUlasan();
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowAuth(true);
      return;
    }
    setBtnLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
        credentials: 'include',
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setMsg('Terjadi kesalahan pada server.');
        setBtnLoading(false);
        return;
      }
      if (res.ok) {
        setMsg('Berhasil ditambahkan ke keranjang!');
      } else {
        setMsg(data.error || 'Gagal menambah ke keranjang');
      }
    } catch (err) {
      setMsg('Terjadi kesalahan jaringan');
    }
    setBtnLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>Memuat detail produk...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bagian Gambar */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.gambar || '/default-product.jpg'}
              alt={product.nama}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Bagian Informasi Produk */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.nama}</h1>
            
            <div className="text-2xl font-semibold text-blue-600">
              Rp{product.harga?.toLocaleString('id-ID')}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium w-24">Kategori:</span>
                <span className="capitalize">{product.kategori}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-24">Stok:</span>
                <span>{product.stok}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Deskripsi Produk</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {product.deskripsi || 'Tidak ada deskripsi'}
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                disabled={btnLoading}
              >
                {btnLoading ? 'Menambah...' : 'Tambah ke Keranjang'}
              </button>
              
            </div>

            {msg && <p className="mt-2 text-sm">{msg}</p>}
          </div>
        </div>
      </div>

      {ulasanList.length > 0 && (
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">Ulasan Pembeli</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-500 text-2xl">{'★'.repeat(Math.round(avgRating))}</span>
            <span className="font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({ulasanList.length} ulasan)</span>
          </div>
          <ul className="space-y-4">
            {ulasanList.map(u => (
              <li key={u.id} className="border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">{'★'.repeat(u.rating)}</span>
                  <span className="text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-gray-700">{u.ulasan}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
    </Layout>
  );
}