import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProdukList() {
  const [produk, setProduk] = useState([]);

  useEffect(() => {
    fetch('/api/produk')
      .then(res => res.json())
      .then(data => setProduk(data));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus produk ini?')) return;
    await fetch(`/api/produk/${id}`, { method: 'DELETE' });
    setProduk(produk.filter(p => p.id !== id));
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Daftar Produk</h1>
        <Link href="/admin/produk/tambah" className="bg-blue-600 text-white px-4 py-2 rounded">
          Tambah Produk
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Gambar</th>
              <th className="p-2">Nama</th>
              <th className="p-2">Harga</th>
              <th className="p-2">Stok</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produk.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">
                  {p.gambar && <img src={p.gambar} alt={p.nama} className="w-20 h-20 object-cover"/>}
                </td>
                <td className="p-2">{p.nama}</td>
                <td className="p-2">Rp{p.harga?.toLocaleString()}</td>
                <td className="p-2">{p.stok}</td>
                <td className="p-2 space-x-2">
                  <Link href={`/admin/produk/${p.id}`} className="text-blue-600">Edit</Link>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}