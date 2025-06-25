// pages/admin/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn) {
          router.push('/admin/login'); // Redirect ke login jika belum login
        } else {
          setIsLoggedIn(true);
        }
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (!isLoggedIn) {
    return null; // Tidak render halaman jika belum login
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white p-5 shadow-lg">
        <h3 className="text-lg font-semibold">Admin Menu</h3>
        <ul className="mt-4">
          <li>
            <a href="/admin/produk" className="block py-2 text-blue-600">Kelola Produk</a>
          </li>
          <li>
            <a href="/admin/users" className="block py-2 text-blue-600">Kelola Users</a>
          </li>
          <li>
            <a href="/admin/orders" className="block py-2 text-blue-600">Konfirmasi Pesanan</a>
          </li>
          <li>
            <button onClick={handleLogout} className="block py-2 text-red-600">Logout</button>
          </li>
        </ul>
      </div>

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold">Dashboard Admin</h1>
        <p className="mt-4">Selamat datang di panel admin. Pilih menu di samping untuk mengelola produk dan pengguna.</p>
      </div>
    </div>
  );
}
