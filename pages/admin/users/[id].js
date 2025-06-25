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
          password: '' // Biarkan password kosong secara default
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
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nama"
          value={form.nama}
          onChange={handleChange}
          className="w-full border p-2"
          placeholder="Nama"
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2"
          placeholder="Email"
          required
        />
        <textarea
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          className="w-full border p-2"
          placeholder="Alamat"
          rows="3"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2"
          placeholder="Password Baru (kosongkan jika tidak ingin mengubah)"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Update
        </button>
      </form>
    </div>
  );
}