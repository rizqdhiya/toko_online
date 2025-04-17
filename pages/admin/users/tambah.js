// pages/admin/users/tambah.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function TambahUser() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const router = useRouter();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    router.push('/admin/users');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Tambah User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Nama" onChange={handleChange} className="w-full border p-2" required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full border p-2" required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
      </form>
    </div>
  );
}
