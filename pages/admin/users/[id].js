// pages/admin/users/[id].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({ 
    nama: '', 
    email: '', 
    password: '',
    alamat: '' 
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/users/${id}`)
        .then(res => res.json())
        .then(data => setForm({
          nama: data.nama,
          email: data.email,
          alamat: data.alamat || '',
          // password: '' // Biarkan password kosong secara default, tapi jangan dihilangkan dari form
        }));
    }
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        nama: form.nama,
        email: form.email,
        alamat: form.alamat,
        ...(form.password && { password: form.password }) // Hanya kirim password jika diisi
      };

      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.push('/admin/users');
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-8">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Edit Pengguna</h1>
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
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password Baru</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
              </div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Update
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}