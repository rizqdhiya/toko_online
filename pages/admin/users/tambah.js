// pages/admin/users/tambah.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function TambahUser() {
  const [form, setForm] = useState({ 
    nama: '', 
    email: '', 
    password: '',
    alamat: '' // Tambahkan field alamat sesuai struktur tabel
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
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Tambah User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          name="nama"
          value={form.nama}
          placeholder="Nama"
          className="w-full border p-2"
          onChange={handleChange}
          required
        />
        <input 
          name="email"
          type="email"
          value={form.email}
          placeholder="Email"
          className="w-full border p-2"
          onChange={handleChange}
          required
        />
        <input 
          name="password"
          type="password"
          value={form.password}
          placeholder="Password"
          className="w-full border p-2"
          onChange={handleChange}
          required
        />
        <textarea
          name="alamat"
          value={form.alamat}
          placeholder="Alamat"
          className="w-full border p-2"
          onChange={handleChange}
          rows="3"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Simpan
        </button>
      </form>
    </div>
  );
}