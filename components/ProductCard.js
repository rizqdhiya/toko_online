import Link from 'next/link';
import Image from 'next/image';
import { useState } from "react";
import { useRouter } from "next/router";
import AuthModal from "./AuthModal";

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
        setMsg("Berhasil ditambahkan ke keranjang!");
      } else {
        setMsg(data.error || "Gagal menambah ke keranjang");
      }
    } catch (err) {
      setMsg("Terjadi kesalahan");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <Link href={`/produk/${product.id}`}>
        <div className="relative aspect-square">
          <Image
            src={product.gambar || '/logo.jpg'}
            alt={product.nama}
            fill
            className="object-cover"
            priority={false}
          />
        </div>
      </Link>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {product.nama}
        </h3>
        <p className="text-gray-600 mt-1">
          Rp{product.harga?.toLocaleString('id-ID')}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Menambah..." : "+ Keranjang"}
          </button>
        </div>
        {msg && <p className="text-sm text-center mt-2">{msg}</p>}
        <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    </div>
  );
}