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
        <Link href="/admin/produk/tambah" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Tambah Produk
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md m-5">
        <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">Gambar</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">Nama</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">Harga</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">Stok</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-700">Aksi</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-100 border-t border-gray-100">
              {produk.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    {p.gambar && (
                      <img src={p.gambar} alt={p.nama} className="w-20 h-20 rounded-md object-cover border" />
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-700">{p.nama}</td>
                  <td className="p-4">Rp{p.harga?.toLocaleString()}</td>
                  <td className="p-4">{p.stok}</td>
                  <td className="p-4 flex space-x-2">
                    <Link
                      href={`/admin/produk/${p.id}`}
                      className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-100 rounded-md"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 bg-red-100 rounded-md"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}