// pages/admin/users/tambah.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function TambahUser() {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    alamat: '',
    no_hp: ''
  });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Gagal menambahkan user');

      router.push('/admin/users');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-8">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Tambah Pengguna Baru</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  name="nama"
                  id="nama"
                  value={form.nama}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Nama"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Email"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Password"
                  required
                />
              </div>
              <div>
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea
                  name="alamat"
                  id="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Alamat"
                />
              </div>
              <div>
                <label htmlFor="no_hp" className="block text-sm font-medium text-gray-700">No. HP</label>
                <input
                  type="tel"
                  name="no_hp"
                  id="no_hp"
                  value={form.no_hp}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="08123456789"
                  required
                />
              </div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Simpan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
