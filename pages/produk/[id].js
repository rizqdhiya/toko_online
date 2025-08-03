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
  const [rekomendasi, setRekomendasi] = useState([]);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [displayImages, setDisplayImages] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [activeThumbnails, setActiveThumbnails] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  
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

    // Fetch ulasan produk (dengan nama user)
    const fetchUlasan = async () => {
      const res = await fetch(`/api/produk/${id}/ulasan`);
      if (res.ok) {
        let data = await res.json();
        // Jika data belum ada nama, fetch nama user
        if (data.length > 0 && !data[0].nama) {
          // Ambil nama user via join di backend (lihat catatan di bawah)
          // Sementara, fetch manual (kurang efisien, sebaiknya backend join)
          data = await Promise.all(
            data.map(async (u) => {
              const resUser = await fetch(`/api/users/${u.user_id}`);
              const userData = resUser.ok ? await resUser.json() : {};
              return { ...u, nama: userData.nama || "Anonim" };
            })
          );
        }
        setUlasanList(data);
        if (data.length > 0) {
          const avg = data.reduce((sum, u) => sum + u.rating, 0) / data.length;
          setAvgRating(avg);
        } else {
          setAvgRating(0);
        }
      }
    };

    // Fetch rekomendasi produk random
    const fetchRekomendasi = async () => {
      const res = await fetch('/api/produk?random=1&limit=4');
      if (res.ok) {
        const data = await res.json();
        setRekomendasi(data.filter(p => p.id !== Number(id)));
      }
    };

    // Fetch variasi & gambar
    const fetchVarian = async () => {
      const res = await fetch(`/api/produk/${id}/varian`);
      if (res.ok) {
        const data = await res.json();
        setVariants(data.variants || []);
        setImages(data.images || []);
        setSelectedVariant(null);
        setDisplayImages((data.images || []).filter(img => !img.variant_id));
      }
    };

    fetchProduct();
    fetchUlasan();
    fetchRekomendasi();
    fetchVarian();
  }, [id]);

  // Update thumbnails & gambar utama saat data/ganti varian
  useEffect(() => {
    let thumbs = [];
    if (!selectedVariant) {
      thumbs = images.filter(img => !img.variant_id);
    } else {
      thumbs = images.filter(img => img.variant_id === selectedVariant.id);
      if (thumbs.length === 0) thumbs = images.filter(img => !img.variant_id);
    }
    setActiveThumbnails(thumbs);
    setActiveImage(thumbs[0]?.url || product?.gambar || '/default-product.png');
  }, [selectedVariant, images, product]);

  useEffect(() => {
    setActiveIndex(0);
  }, [images, variants]);
  useEffect(() => {
    setSelectedVariant(null);
    setActiveIndex(0);
  }, [id]);
  // Deklarasi allThumbnails di atas useEffect
  const allThumbnails = [
    ...images.filter(img => !img.variant_id),
    ...variants.flatMap(variant =>
      images.filter(img => img.variant_id === variant.id)
    ),
  ];

  useEffect(() => {
    setActiveImage(allThumbnails[activeIndex]?.url || product?.gambar || '/default-product.png');
  }, [activeIndex, allThumbnails, product]);

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
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          variant_id: selectedVariant ? selectedVariant.id : null
        }),
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

  const handleSelectVariant = (variant) => {

    if (selectedVariant?.id === variant.id) {
      setSelectedVariant(null); // reset ke produk utama
      setActiveIndex(0);
    } else {
      setSelectedVariant(variant);
      const idx = allThumbnails.findIndex(img => img.variant_id === variant.id);
      setActiveIndex(idx !== -1 ? idx : 0);
    }
  };

  let displayProductName = '';
  if (product) {
    displayProductName = selectedVariant
      ? `${product.nama} ${selectedVariant.warna}`
      : product.nama;
  }

  if (loading || !product) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Gambar Produk */}
          <div className="relative flex flex-col items-center">
            {/* Gambar utama */}
            <div className="relative aspect-square w-full bg-gradient-to-br from-blue-100 to-white rounded-2xl overflow-hidden shadow-lg flex items-center justify-center mb-4">
              <Image
                src={activeImage}
                alt={displayProductName}
                fill
                className="object-contain"
                priority
              />
              {/* Info varian di pojok */}
              {allThumbnails[activeIndex]?.variant_id && (
                <span className="absolute left-2 bottom-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                  {variants.find(v => v.id === allThumbnails[activeIndex].variant_id)?.warna}
                </span>
              )}
              {/* Tombol panah */}
              {activeIndex > 0 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
                  onClick={() => setActiveIndex(activeIndex - 1)}
                  type="button"
                >&#8592;</button>
              )}
              {activeIndex < allThumbnails.length - 1 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
                  onClick={() => setActiveIndex(activeIndex + 1)}
                  type="button"
                >&#8594;</button>
              )}
            </div>

            {/* Thumbnail gambar */}
            <div className="flex gap-2 mb-4">
              {allThumbnails.map((img, idx) => (
                <button
                  key={img.id}
                  className={`relative w-16 h-16 rounded-lg border-2 ${activeIndex === idx ? 'border-blue-600' : 'border-gray-200'} overflow-hidden`}
                  onClick={() => setActiveIndex(idx)}
                  type="button"
                >
                  <img src={img.url} alt={`thumb-${idx}`} className="object-contain w-full h-full" />
                  {/* Info varian di thumbnail */}
                  {img.variant_id && (
                    <span className="absolute left-1 bottom-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {variants.find(v => v.id === img.variant_id)?.warna}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Info Produk */}
          <div className="flex flex-col justify-between space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{displayProductName}</h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {product.kategori}
                </span>
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Stok: {product.stok}
                </span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                Rp{product.harga?.toLocaleString('id-ID')}
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Deskripsi Produk</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.deskripsi || 'Tidak ada deskripsi'}
                </p>
              </div>
            </div>
            {/* Tombol variasi pindah ke sini */}
            {variants.length > 0 && (
              <div className="flex gap-3 mb-4">
                {variants.map(variant => (
                  <button
                    key={variant.id}
                    className={`flex items-center justify-center px-4 py-2 rounded-full border-2 font-semibold shadow transition
            ${selectedVariant?.id === variant.id
              ? 'bg-blue-600 text-white border-blue-600 scale-105'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'}`}
                    onClick={() => handleSelectVariant(variant)}
                    type="button"
                    title={variant.warna}
                  >
                    {variant.warna}
                  </button>
                ))}
              </div>
            )}
            <div>
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-xl font-semibold text-lg shadow hover:from-blue-700 hover:to-blue-500 transition"
                disabled={btnLoading}
              >
                {btnLoading ? 'Menambah...' : 'Tambah ke Keranjang'}
              </button>
              {msg && <p className="mt-2 text-center text-sm text-blue-700">{msg}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ULASAN */}
      <div className="max-w-3xl mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>Ulasan Pembeli</span>
            {ulasanList.length > 0 && (
              <>
                <span className="text-yellow-400 text-2xl">{'★'.repeat(Math.round(avgRating))}</span>
                <span className="font-semibold text-lg">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({ulasanList.length} ulasan)</span>
              </>
            )}
          </h2>
          {ulasanList.length === 0 ? (
            <div className="text-gray-400 italic py-8 text-center">Belum ada ulasan untuk produk ini.</div>
          ) : (
            <ul className="space-y-6">
              {ulasanList.map(u => (
                <li key={u.id} className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-yellow-400 text-lg">{'★'.repeat(u.rating)}</span>
                    <span className="text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">{u.nama || 'Anonim'}</span>
                  </div>
                  <div className="text-gray-700">{u.ulasan}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* REKOMENDASI PRODUK */}
      {rekomendasi.length > 0 && (
        <div className="max-w-7xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6">Rekomendasi Produk Lainnya</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {rekomendasi.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-4 flex flex-col group"
              >
                <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative flex items-center justify-center">
                  <Image
                    src={p.gambar || '/default-product.jpg'}
                    alt={p.nama}
                    fill
                    className="object-contain group-hover:scale-105 transition"
                  />
                </div>
                <div className="font-semibold truncate mb-1">{p.nama}</div>
                <div className="text-blue-600 font-bold mb-2">Rp{p.harga?.toLocaleString('id-ID')}</div>
                <button
                  className="mt-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow hover:from-blue-700 hover:to-blue-500 transition"
                  onClick={() => router.push(`/produk/${p.id}`)}
                >
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
    </Layout>
  );
}