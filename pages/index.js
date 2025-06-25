import BannerSlider from "@/components/BannerSlider";
import Navbar from "@/components/Navbar";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const search = router.query.search || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const url = search
          ? `/api/produk?search=${encodeURIComponent(search)}`
          : `/api/produk`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Gagal memuat produk');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [search]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Memuat produk...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* BannerSlider hanya tampil jika tidak sedang search */}
      {!search && <BannerSlider />}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
}