import Link from 'next/link';
import Image from 'next/image';
import { useState } from "react";
import { useRouter } from "next/router";
import AuthModal from "./AuthModal";
import { FiPlus } from 'react-icons/fi'; // Mengimpor ikon

export default function ProductCard({ product }) {
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleAddToCart = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setShowAuth(true);
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Berhasil ditambahkan!");
        // Hilangkan pesan setelah beberapa detik
        setTimeout(() => setMsg(""), 2000);
      } else {
        setMsg(data.error || "Gagal menambah");
        setTimeout(() => setMsg(""), 2000);
      }
    } catch (err) {
      setMsg("Terjadi kesalahan");
      setTimeout(() => setMsg(""), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group">
      <Link href={`/produk/${product.id}`} className="block overflow-hidden rounded-t-2xl">
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={product.gambar || '/logo.jpg'}
            alt={product.nama}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-800 truncate mb-1" title={product.nama}>
          {product.nama}
        </h3>
        <p className="text-lg font-bold text-blue-600 mb-3">
          Rp{product.harga?.toLocaleString('id-ID')}
        </p>
        
        <div className="mt-auto">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2.5 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <FiPlus />
            {loading ? "Menambah..." : "Keranjang"}
          </button>
        </div>

        {msg && (
          <p className={`text-xs text-center mt-2 p-1.5 rounded-md ${
            msg.includes('Berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {msg}
          </p>
        )}
        <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    </div>
  );
}
