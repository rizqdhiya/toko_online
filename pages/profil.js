import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { FiCamera, FiEdit, FiClipboard, FiLogOut, FiUser, FiMail, FiMapPin, FiGift, FiStar, FiShoppingBag, FiCheckCircle, FiXCircle, FiClock, FiTruck, FiArchive } from "react-icons/fi";

// Komponen untuk menampilkan statistik
const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-transform hover:scale-105`}>
    <div className={`p-3 bg-white rounded-full shadow`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// Komponen untuk item di riwayat pesanan
const OrderHistoryItem = ({ order, onSelect }) => (
    <tr onClick={() => onSelect(order)} className="hover:bg-indigo-50 cursor-pointer border-b border-gray-200">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">Rp{order.total.toLocaleString('id-ID')}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
            {order.status === 'diproses' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><FiClock/> Diproses</span>}
            {order.status === 'menunggu_konfirmasi' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"><FiClock/> Menunggu Konfirmasi</span>}
            {order.status === 'batal' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><FiXCircle/> Batal</span>}
            {order.status === 'menunggu_pembayaran' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"><FiClock/> Belum Bayar</span>}
            {order.status === 'dikirim' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800"><FiTruck/> Dikirim</span>}
            {order.status === 'diterima' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800"><FiArchive/> Diterima</span>}
            {order.status === 'selesai' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><FiCheckCircle/> Selesai</span>}
        </td>
    </tr>
);


export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ nama: "", email: "", alamat: "", password: "" });
  const [foto, setFoto] = useState("");
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  // State tambahan
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const [sendingUlasan, setSendingUlasan] = useState(false);
  const [ulasanList, setUlasanList] = useState([]);
  const [ulasanProduk, setUlasanProduk] = useState({});
  const [ratingProduk, setRatingProduk] = useState({});
  const [editUlasanProdukId, setEditUlasanProdukId] = useState(null);

  // Ambil data user saat halaman dibuka
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users/profile", { credentials: "include" });
        if (res.status === 401) {
          router.replace("/");
          return;
        }
        const data = await res.json();
        setUser(data);
        setForm({ nama: data.nama, email: data.email, alamat: data.alamat || "" });
        setFoto(data.foto || "");
        setPreview(data.foto || "");
      } catch {
        setMsg("Gagal mengambil data profil");
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    // Ambil orders saat halaman dibuka
    const fetchOrdersOnLoad = async () => {
      try {
        const res = await fetch("/api/myorders", { credentials: "include" });
        const data = await res.json();
        setOrders(data);
      } catch {
        setMsg("Gagal mengambil riwayat pesanan");
      }
    };
    fetchOrdersOnLoad();
  }, []);

  // Ambil riwayat pesanan user
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/myorders", { credentials: "include" });
      const data = await res.json();
      setOrders(data);
      setShowHistory(true);
    } catch {
      setMsg("Gagal mengambil riwayat pesanan");
    }
    setLoading(false);
  };

  // Handle upload foto profil
  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setMsg("Mengupload foto...");
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok && data.url) {
      setPreview(data.url);
      setFoto(data.url);
      await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto: data.url }),
        credentials: "include",
      });
      setMsg("Foto profil berhasil diupdate");
      localStorage.setItem("authFoto", data.url);
    } else {
      setMsg("Gagal upload foto");
    }
  };

  const handleProfilePicClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Handle update data profil (nama, email, alamat)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const payload = { ...form, foto };
      if (!form.password) delete payload.password;
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Profil berhasil diupdate");
        localStorage.setItem("authNama", form.nama);
        setEditMode(false);
        setForm(f => ({ ...f, password: "" })); 
      } else {
        setMsg(data.error || "Gagal update profil");
      }
    } catch {
      setMsg("Gagal update profil");
    }
    setLoading(false);
  };

    const handleUploadBukti = async () => {
    if (!buktiFile || !selectedOrder) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', buktiFile);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok && data.url) {
      await fetch(`/api/orders/${selectedOrder.id}/bukti`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bukti_bayar: data.url }),
        credentials: 'include',
      });
      alert('Bukti pembayaran berhasil dikirim. Menunggu konfirmasi admin.');
      setShowHistory(false);
      setSelectedOrder(null);
      setBuktiFile(null);
      setBuktiPreview("");
      fetchOrders();
    }
    setUploading(false);
  };

  const handleBatalOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;
    await fetch(`/api/konfirmasi?orderId=${selectedOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batal: true }),
      credentials: 'include',
    });
    alert('Pesanan berhasil dibatalkan.');
    setShowHistory(false);
    setSelectedOrder(null);
    fetchOrders();
  };

  // Fetch ulasan saat buka detail order
  useEffect(() => {
    if (selectedOrder) {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/orders/${selectedOrder.id}/ulasan`, {credentials: 'include'});
                if(res.ok) {
                    const data = await res.json();
                    setUlasanList(data);
                }
            } catch (error) {
                console.error("Gagal fetch ulasan", error);
            }
        }
        fetchReviews();
    }
  }, [selectedOrder]);

  const handlePesananDiterima = async () => {
    if (!selectedOrder) return;
    await fetch(`/api/orders/${selectedOrder.id}/diterima`, {
      method: 'PUT',
      credentials: 'include',
    });
    alert('Pesanan telah diterima. Silakan beri ulasan!');
    // Refresh orders untuk update status
    const updatedOrders = orders.map(o => o.id === selectedOrder.id ? {...o, status: 'diterima'} : o);
    setOrders(updatedOrders);
    setSelectedOrder({ ...selectedOrder, status: 'diterima' });
  };
  
  // Map ulasan ke produk yang sesuai saat order dipilih
  useEffect(() => {
    if (selectedOrder && Array.isArray(selectedOrder.items) && ulasanList.length > 0) {
      const mapUlasan = {};
      const mapRating = {};
      for (const item of selectedOrder.items) {
        const ulasanLama = ulasanList.find(u => u.product_id === (item.produk_id || item.product_id) && u.user_id === user?.id && u.order_id === selectedOrder.id);
        if (ulasanLama) {
          mapUlasan[item.produk_id || item.product_id] = ulasanLama.ulasan;
          mapRating[item.produk_id || item.product_id] = ulasanLama.rating;
        }
      }
      setUlasanProduk(mapUlasan);
      setRatingProduk(mapRating);
    }
  }, [selectedOrder, ulasanList, user]);

  const handleKirimUlasan = async () => {
    if (!selectedOrder) return;
    
    setSendingUlasan(true);
    const itemsToReview = selectedOrder.items.filter(item => 
        !ulasanList.find(u => u.product_id === (item.produk_id || item.product_id) && u.user_id === user?.id)
    );

    for (const item of itemsToReview) {
        const productId = item.produk_id || item.product_id;
        const ulasan = ulasanProduk[productId];
        const rating = ratingProduk[productId] || 5;

        if(ulasan && ulasan.trim()) {
            await fetch(`/api/produk/${productId}/ulasan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ulasan,
                    rating,
                    order_id: selectedOrder.id
                }),
                credentials: 'include',
            });
        }
    }
    
    alert('Terima kasih atas ulasan Anda!');
    // Refresh ulasan
    const res = await fetch(`/api/orders/${selectedOrder.id}/ulasan`);
    if(res.ok) setUlasanList(await res.json());

    setSendingUlasan(false);
    setEditUlasanProdukId(null);
  };
  
  const handleSimpanEditUlasan = async (productId) => {
    setSendingUlasan(true);
    const ulasan = ulasanProduk[productId];
    const rating = ratingProduk[productId];

    await fetch(`/api/produk/${productId}/ulasan`, {
      method: 'POST', // API route handles both create and update with POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ulasan,
        rating,
        order_id: selectedOrder.id
      }),
      credentials: 'include',
    });

    alert('Ulasan berhasil diperbarui!');
    
    // Refresh ulasan
    const res = await fetch(`/api/orders/${selectedOrder.id}/ulasan`);
    if(res.ok) setUlasanList(await res.json());

    setSendingUlasan(false);
    setEditUlasanProdukId(null); // Keluar dari mode edit
  };


  if (loading && !user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 animate-pulse text-lg">Memuat profil...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {editMode ? (
            // FORM EDIT PROFIL
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
                <form onSubmit={handleSubmit} className="w-full space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Edit Profil</h2>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <img src={preview || "/default-profile.png"} alt="Foto Profil" className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-lg"/>
                    <button type="button" onClick={handleProfilePicClick} className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiCamera size={24} />
                    </button>
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFotoChange} className="hidden"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                        <input type="text" className="w-full bg-gray-50 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 transition" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full p-3 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed" value={form.email} disabled />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea className="w-full bg-gray-50 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 transition h-24" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })}/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input type="password" className="w-full bg-gray-50 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 transition" value={form.password || ""} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Kosongkan jika tidak ingin mengubah"/>
                    </div>
                </div>
                <div className="flex gap-4 pt-4">
                    <button type="button" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold shadow-sm transition" onClick={() => setEditMode(false)}>Batal</button>
                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition disabled:bg-indigo-400" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</button>
                </div>
                {msg && <div className="text-center text-sm mt-4 p-3 rounded-lg bg-indigo-50 text-indigo-700">{msg}</div>}
                </form>
            </div>
          ) : (
            // TAMPILAN PROFIL BIASA
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <img src={preview || "/default-profile.png"} alt="Foto Profil" className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-2xl"/>
                    <button onClick={handleProfilePicClick} className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Ganti foto">
                      <FiCamera size={32} />
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFotoChange} className="hidden" />
                  </div>
                  <div className="text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Selamat Datang, {form.nama}!</h1>
                    <p className="text-gray-500 mt-2 flex items-center justify-center md:justify-start gap-2"><FiMail/> {form.email}</p>
                    <p className="text-gray-600 mt-2 flex items-center justify-center md:justify-start gap-2"><FiMapPin/> {form.alamat || <span className="italic">Alamat belum diatur</span>}</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2" onClick={() => setEditMode(true)}><FiEdit/> Edit Profil</button>
                        <button className="flex-1 bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2" onClick={fetchOrders}><FiClipboard/> Riwayat Pesanan</button>
                    </div>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard icon={<FiShoppingBag className="text-blue-500" size={24}/>} label="Total Pesanan" value={orders.length} color="blue" />
                 <StatCard icon={<FiCheckCircle className="text-green-500" size={24}/>} label="Pesanan Selesai" value={orders.filter(o => o.status === 'diterima' || o.status === 'selesai').length} color="green"/>
                 <StatCard icon={<FiClock className="text-yellow-500" size={24}/>} label="Dalam Proses" value={orders.filter(o => o.status === 'diproses' || o.status === 'dikirim').length} color="yellow"/>
                 <StatCard icon={<FiXCircle className="text-red-500" size={24}/>} label="Dibatalkan" value={orders.filter(o => o.status === 'batal').length} color="red"/>
              </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktivitas Terbaru</h2>
                    {orders.length > 0 ? (
                        <ul className="space-y-4">
                        {orders.slice(0, 4).map(order => (
                            <li key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-full shadow">
                                        {order.status === 'selesai' || order.status === 'diterima' ? <FiCheckCircle className="text-green-500"/> : <FiClock className="text-yellow-500"/>}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700">Pesanan #{order.id}</p>
                                        <p className="text-sm text-gray-500">Total: Rp{order.total.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">{order.status.replace('_', ' ')}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Tidak ada aktivitas terbaru.</p>
                    )}
                </div>

            </div>
          )}
        </div>
      </div>
      
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 relative m-4">
             <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10"
              onClick={() => { setShowHistory(false); setSelectedOrder(null); }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Riwayat Pesanan</h2>
            <div className="flex-grow overflow-y-auto pr-2">
            {!selectedOrder ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3 px-6 rounded-l-lg">ID Pesanan</th>
                                <th scope="col" className="py-3 px-6">Tanggal</th>
                                <th scope="col" className="py-3 px-6">Total</th>
                                <th scope="col" className="py-3 px-6">Status</th>
                                <th scope="col" className="py-3 px-6 rounded-r-lg"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <OrderHistoryItem key={order.id} order={order} onSelect={setSelectedOrder} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <div className="p-2 animate-fade-in-up">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-800">
                      Detail Pesanan <span className="text-indigo-600">#{selectedOrder.id}</span>
                    </h3>
                     <button
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        onClick={() => setSelectedOrder(null)}
                      >
                        &larr; Kembali ke Riwayat
                      </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-3">
                            <p className="text-sm text-gray-500 mb-1">Status</p>
                            <div>
                                {selectedOrder.status === 'diproses' && <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Diproses</span>}
                                {selectedOrder.status === 'menunggu_konfirmasi' && <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Menunggu Konfirmasi</span>}
                                {selectedOrder.status === 'batal' && (
                                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    Batal
                                    {selectedOrder.alasan_batal && <span className="font-normal"> ({selectedOrder.alasan_batal.replace(/_/g, ' ')})</span>}
                                    </span>
                                )}
                                {selectedOrder.status === 'menunggu_pembayaran' && <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">Menunggu Pembayaran</span>}
                                {selectedOrder.status === 'dikirim' && <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">Dikirim</span>}
                                {selectedOrder.status === 'diterima' && <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">Diterima</span>}
                                {selectedOrder.status === 'selesai' && <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Selesai</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tanggal Pesanan</p>
                            <p className="font-medium text-gray-800">{new Date(selectedOrder.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                            <p className="font-bold text-xl text-indigo-600">Rp{selectedOrder.total.toLocaleString('id-ID')}</p>
                        </div>
                        {selectedOrder.status === 'dikirim' && selectedOrder.no_resi && (
                            <div>
                            <p className="text-sm text-gray-500 mb-1">No. Resi Pengiriman</p>
                            <p className="font-medium text-teal-700 bg-teal-100 px-3 py-1 rounded-full inline-block">{selectedOrder.no_resi}</p>
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500 mb-1">Alamat Pengiriman</p>
                            <p className="font-medium text-gray-800 leading-relaxed">
                            {selectedOrder.alamat || "-"}
                            <br />
                            <span className="text-sm text-gray-600">
                                {selectedOrder.kota_nama}, {selectedOrder.provinsi_nama}
                            </span>
                            {selectedOrder.ongkir !== undefined && (
                                <span className="text-xs text-gray-500 block mt-1">
                                (Ongkir: Rp{Number(selectedOrder.ongkir).toLocaleString('id-ID')})
                                </span>
                            )}
                            </p>
                        </div>
                         {selectedOrder.bukti_bayar && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Bukti Bayar</p>
                                <a href={selectedOrder.bukti_bayar} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                                    Lihat Bukti
                                </a>
                            </div>
                        )}
                    </div>
                  </div>

                 <div className="mt-6 space-y-6">
                    {/* ACTION BUTTONS */}
                    {selectedOrder.status === 'menunggu_pembayaran' && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="font-semibold text-lg mb-4 text-gray-700">Aksi Pembayaran</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium mb-2">Upload Bukti Pembayaran</label>
                                    <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setBuktiFile(file);
                                        setBuktiPreview(URL.createObjectURL(file));
                                    }}
                                    />
                                    {buktiPreview && <img src={buktiPreview} className="w-48 mt-4 rounded-lg shadow-sm" />}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        className="w-full sm:w-auto flex-grow bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                                        onClick={handleUploadBukti}
                                        disabled={uploading || !buktiFile}
                                    >
                                        {uploading ? "Mengirim..." : "Kirim Bukti"}
                                    </button>
                                    <button
                                        className="w-full sm:w-auto flex-grow bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                                        onClick={handleBatalOrder}
                                    >
                                        Batalkan Pesanan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {selectedOrder.status === 'dikirim' && (
                        <div className="flex justify-center">
                            <button
                                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
                                onClick={handlePesananDiterima}
                            >
                                Tandai Pesanan Telah Diterima
                            </button>
                        </div>
                    )}

                    {/* REVIEW SECTION */}
                    {(selectedOrder.status === 'diterima' || selectedOrder.status === 'selesai') && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="font-semibold text-lg mb-4 text-gray-700">Ulasan Produk</h4>
                            
                            {ulasanList.length > 0 && ulasanList.filter(u => u.user_id === user?.id).length > 0 && (
                                <div className="mb-6">
                                    <h5 className="font-semibold text-gray-600 mb-3">Ulasan Anda</h5>
                                    <ul className="space-y-4">
                                        {ulasanList.filter(u => u.user_id === user?.id).map(u => {
                                            const item = selectedOrder.items.find(i => (i.produk_id || i.product_id) === u.product_id);
                                            const productId = u.product_id;
                                            return (
                                            <li key={u.id} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{item?.nama}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-yellow-400">{'★'.repeat(u.rating)}{'☆'.repeat(5 - u.rating)}</span>
                                                            <span className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-gray-600 mt-2">{u.ulasan}</p>
                                                    </div>
                                                    <button onClick={() => setEditUlasanProdukId(productId)} className="text-sm text-indigo-600 hover:underline">
                                                        Edit
                                                    </button>
                                                </div>

                                                {editUlasanProdukId === productId && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                        <textarea
                                                            value={ulasanProduk[productId] || ""}
                                                            onChange={e => setUlasanProduk({ ...ulasanProduk, [productId]: e.target.value })}
                                                            className="w-full border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <select
                                                                value={ratingProduk[productId] || 5}
                                                                onChange={e => setRatingProduk({ ...ratingProduk, [productId]: Number(e.target.value) })}
                                                                className="border-gray-300 rounded-lg px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                            >
                                                                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
                                                            </select>
                                                            <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm" disabled={sendingUlasan} onClick={() => handleSimpanEditUlasan(productId)}>Simpan</button>
                                                            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm" onClick={() => setEditUlasanProdukId(null)}>Batal</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        )})}
                                    </ul>
                                </div>
                            )}

                            {(() => {
                                const itemsBelumDiulas = Array.isArray(selectedOrder.items)
                                    ? selectedOrder.items.filter(item => !ulasanList.find(u => u.product_id === (item.produk_id || item.product_id) && u.user_id === user?.id))
                                    : [];
                                if (itemsBelumDiulas.length === 0) return <p className="text-sm text-center text-gray-500">Semua produk telah diulas. Terima kasih!</p>;

                                return (
                                    <div className="space-y-4">
                                        <h5 className="font-semibold text-gray-600">Ulasi Produk yang Belum Diulas:</h5>
                                        {itemsBelumDiulas.map(item => {
                                            const productId = item.produk_id || item.product_id;
                                            return(
                                            <div key={productId} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <p className="font-semibold text-gray-800">{item.nama}</p>
                                                <textarea
                                                    value={ulasanProduk[productId] || ""}
                                                    onChange={e => setUlasanProduk({ ...ulasanProduk, [productId]: e.target.value })}
                                                    placeholder={`Bagaimana pendapat Anda tentang ${item.nama}?`}
                                                    className="w-full border-gray-300 rounded-lg p-2 mt-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span>Rating:</span>
                                                    <select
                                                        value={ratingProduk[productId] || 5}
                                                        onChange={e => setRatingProduk({ ...ratingProduk, [productId]: Number(e.target.value) })}
                                                        className="border-gray-300 rounded-lg px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                    <span className="text-yellow-400">★</span>
                                                </div>
                                            </div>
                                        )})}
                                        <button
                                            className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                                            disabled={sendingUlasan}
                                            onClick={handleKirimUlasan}
                                        >
                                            {sendingUlasan ? "Mengirim Ulasan..." : "Kirim Semua Ulasan"}
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                 </div>
                </div>
            )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}