import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ nama: "", email: "", alamat: "" });
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

  // Tambahan state
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const [ulasan, setUlasan] = useState("");
  const [rating, setRating] = useState(5);
  const [sendingUlasan, setSendingUlasan] = useState(false);
  const [ulasanList, setUlasanList] = useState([]);
  const [editUlasanMode, setEditUlasanMode] = useState(false);
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
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, foto }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Profil berhasil diupdate");
        localStorage.setItem("authNama", form.nama);
        setEditMode(false);
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
      // Optionally refresh orders
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
      fetch(`/api/orders/${selectedOrder.id}/ulasan`)
        .then(res => res.json())
        .then(setUlasanList);
    }
  }, [selectedOrder]);

  // Handler submit ulasan
  const handleUlasan = async () => {
    if (!selectedOrder) return;
    setSendingUlasan(true);
    await fetch(`/api/orders/${selectedOrder.id}/ulasan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ulasan, rating }),
      credentials: 'include',
    });
    alert('Terima kasih atas ulasan Anda!');
    setShowHistory(false);
    setSelectedOrder(null);
    setUlasan("");
    setRating(5);
    fetchOrders();
    setSendingUlasan(false);
  };

  // Handler pesanan diterima
  const handlePesananDiterima = async () => {
    if (!selectedOrder) return;
    await fetch(`/api/orders/${selectedOrder.id}/diterima`, {
      method: 'PUT',
      credentials: 'include',
    });
    alert('Pesanan telah diterima. Silakan beri ulasan!');
    fetchOrders();
    setSelectedOrder({ ...selectedOrder, status: 'diterima' });
  };

  useEffect(() => {
    console.log('selectedOrder', selectedOrder);
    console.log('ulasanList', ulasanList);
    if (
      selectedOrder &&
      Array.isArray(selectedOrder.items) &&
      ulasanList.length > 0
    ) {
      const mapUlasan = {};
      const mapRating = {};
      for (const item of selectedOrder.items) {
        const ulasanLama = ulasanList.find(
          u =>
            u.product_id === item.product_id &&
            u.user_id === user?.id &&
            u.order_id === selectedOrder.id
        );
        if (ulasanLama) {
          mapUlasan[item.product_id] = ulasanLama.ulasan;
          mapRating[item.product_id] = ulasanLama.rating;
        }
      }
      setUlasanProduk(mapUlasan);
      setRatingProduk(mapRating);
    }
  }, [selectedOrder, ulasanList, user]);

  if (loading && !user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Memuat profil...</p>
        </div>
      </Layout>
    );
  }

  // Cek apakah user sudah pernah mengulas order ini
  const myUlasan = ulasanList.find(u => u.user_id === user?.id);

  return (
    <Layout>
      <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>
        <div className="flex flex-col items-center gap-2 mb-4">
          <label className="font-medium">Foto Profil</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFotoChange}
            style={{ display: "none" }}
          />
          <img
            src={preview || "/default-profile.png"}
            alt="Foto Profil"
            className="w-24 h-24 rounded-full object-cover border cursor-pointer"
            onClick={handleProfilePicClick}
            title="Klik untuk ganti foto"
          />
        </div>

        {!editMode ? (
          <>
            <div className="mb-2"><b>Nama:</b> {form.nama}</div>
            <div className="mb-2"><b>Email:</b> {form.email}</div>
            <div className="mb-4"><b>Alamat:</b> {form.alamat}</div>
            <div className="flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setEditMode(true)}
              >
                Edit Profil
              </button>
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded"
                onClick={fetchOrders}
              >
                Lihat Riwayat Pesanan
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block font-medium mb-1">Nama</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={form.nama}
                onChange={e => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full border p-2 rounded"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                disabled
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Alamat</label>
              <textarea
                className="w-full border p-2 rounded"
                value={form.alamat}
                onChange={e => setForm({ ...form, alamat: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setEditMode(false)}
              >
                Batal
              </button>
            </div>
            {msg && <div className="text-center text-sm mt-2">{msg}</div>}
          </form>
        )}

        {/* Modal/section riwayat pesanan */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur">
            <div className="bg-white rounded shadow-lg max-w-xl w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500"
                onClick={() => {
                  setShowHistory(false);
                  setSelectedOrder(null);
                  setBuktiFile(null);
                  setBuktiPreview("");
                }}
              >✕</button>
              <h2 className="text-xl font-bold mb-4">Riwayat Pesanan</h2>
              {!selectedOrder ? (
                <table className="w-full mb-4">
                  <thead>
                    <tr>
                      <th className="text-left">ID</th>
                      <th className="text-left">Tanggal</th>
                      <th className="text-left">Total</th>
                      <th className="text-left">Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{new Date(order.created_at).toLocaleString()}</td>
                        <td>Rp{order.total.toLocaleString('id-ID')}</td>
                        <td>
                          {order.status === 'diproses' && <span className="text-blue-600">Diproses</span>}
                          {order.status === 'menunggu_konfirmasi' && <span className="text-yellow-600">Menunggu Konfirmasi</span>}
                          {order.status === 'batal' && <span className="text-red-600">Batal</span>}
                          {order.status === 'menunggu_pembayaran' && <span className="text-gray-600">Belum Bayar</span>}
                          {order.status === 'dikirim' && <span className="text-green-600">Dikirim</span>}
                          {order.status === 'diterima' && <span className="text-indigo-600">Diterima</span>}
                          {order.status === 'selesai' && <span className="text-green-800">Selesai</span>}
                        </td>
                        <td>
                          <button
                            className="text-blue-600 underline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setBuktiFile(null);
                              setBuktiPreview("");
                            }}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>
                  <h3 className="font-semibold mb-2">Detail Pesanan #{selectedOrder.id}</h3>
                  <div className="mb-2">Tanggal: {new Date(selectedOrder.created_at).toLocaleString()}</div>
                  <div className="mb-2">Total: <b>Rp{selectedOrder.total.toLocaleString('id-ID')}</b></div>
                  <div className="mb-2">Status: <b>
                    {selectedOrder.status === 'diproses' && <span className="text-blue-600">Diproses</span>}
                    {selectedOrder.status === 'menunggu_konfirmasi' && <span className="text-yellow-600">Menunggu Konfirmasi</span>}
                    {selectedOrder.status === 'batal' && <span className="text-red-600">Batal</span>}
                    {selectedOrder.status === 'menunggu_pembayaran' && <span className="text-gray-600">Belum Bayar</span>}
                    {selectedOrder.status === 'dikirim' && <span className="text-green-600">Dikirim</span>}
                    {selectedOrder.status === 'diterima' && <span className="text-indigo-600">Diterima</span>}
                    {selectedOrder.status === 'selesai' && <span className="text-green-800">Selesai</span>}
                  </b></div>
                  {selectedOrder.bukti_bayar && (
                    <div className="mb-2">
                      Bukti Bayar: <a href={selectedOrder.bukti_bayar} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a>
                    </div>
                  )}
                  {/* Tampilkan nomor resi jika status dikirim */}
                  {selectedOrder.status === 'dikirim' && selectedOrder.no_resi && (
                    <div className="mb-2">
                      <b>No. Resi:</b> <span className="text-green-700">{selectedOrder.no_resi}</span>
                    </div>
                  )}

                  {/* Jika belum bayar, tampilkan upload bukti & batal */}
                  {selectedOrder.status === 'menunggu_pembayaran' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block font-medium mb-1">Upload Bukti Pembayaran</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setBuktiFile(file);
                            setBuktiPreview(URL.createObjectURL(file));
                          }}
                        />
                        {buktiPreview && <img src={buktiPreview} className="w-40 mt-2" />}
                        <button
                          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                          onClick={handleUploadBukti}
                          disabled={uploading}
                        >
                          {uploading ? "Mengirim..." : "Kirim Bukti"}
                        </button>
                      </div>
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded"
                        onClick={handleBatalOrder}
                      >
                        Batalkan Pesanan
                      </button>
                    </div>
                  )}

                  {/* Jika sudah dikirim dan belum selesai, tampilkan tombol terima pesanan */}
                  {selectedOrder.status === 'dikirim' && (
                    <div className="mt-4 space-y-3">
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded"
                        onClick={handlePesananDiterima}
                      >
                        Pesanan Diterima
                      </button>
                    </div>
                  )}

                  {/* Render ulasan yang sudah ada */}
                  {ulasanList.length > 0 && (
                    <div className="mt-4">
                      <b>Ulasan:</b>
                      <ul className="mt-2 space-y-2">
                        {ulasanList.map(u => (
                          <li
                            key={u.id}
                            className={`border rounded p-2 ${u.user_id === user?.id ? "cursor-pointer hover:bg-yellow-50" : ""}`}
                            onClick={() => {
                              if (u.user_id === user?.id && (selectedOrder.status === 'diterima' || selectedOrder.status === 'selesai')) {
                                setEditUlasanProdukId(u.product_id);
                                setUlasanProduk({ ...ulasanProduk, [u.product_id]: u.ulasan });
                                setRatingProduk({ ...ratingProduk, [u.product_id]: u.rating });
                              }
                            }}
                            title={u.user_id === user?.id ? "Klik untuk edit ulasan Anda" : ""}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500">{'★'.repeat(u.rating)}</span>
                              <span className="text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                              {u.user_id === user?.id && <span className="text-xs text-blue-600 ml-2">(Ulasan Anda)</span>}
                            </div>
                            <div>{u.ulasan}</div>
                            {/* Tampilkan form edit jika sedang edit produk ini */}
                            {editUlasanProdukId === u.product_id && (
                              <div className="mt-2">
                                <textarea
                                  value={ulasanProduk[u.product_id] || ""}
                                  onChange={e => setUlasanProduk({ ...ulasanProduk, [u.product_id]: e.target.value })}
                                  className="w-full border p-2 rounded"
                                  disabled={sendingUlasan}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                  <span>Rating:</span>
                                  <select
                                    value={ratingProduk[u.product_id] || 5}
                                    onChange={e => setRatingProduk({ ...ratingProduk, [u.product_id]: Number(e.target.value) })}
                                    className="border rounded px-2 py-1"
                                    disabled={sendingUlasan}
                                  >
                                    {[5,4,3,2,1].map(r => (
                                      <option key={r} value={r}>{r}</option>
                                    ))}
                                  </select>
                                  <span className="text-yellow-500">★</span>
                                  <button
                                    className="ml-2 bg-blue-600 text-white px-3 py-1 rounded"
                                    disabled={sendingUlasan}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setSendingUlasan(true);
                                      await fetch(`/api/produk/${u.product_id}/ulasan`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          ulasan: ulasanProduk[u.product_id],
                                          rating: ratingProduk[u.product_id] || 5,
                                          order_id: selectedOrder.id
                                        }),
                                        credentials: 'include',
                                      });
                                      setEditUlasanProdukId(null);
                                      // Refresh ulasanList
                                      const res = await fetch(`/api/orders/${selectedOrder.id}/ulasan`);
                                      setUlasanList(await res.json());
                                      setSendingUlasan(false);
                                    }}
                                  >
                                    Simpan
                                  </button>
                                  <button
                                    className="ml-2 bg-gray-400 text-white px-3 py-1 rounded"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setEditUlasanProdukId(null);
                                    }}
                                  >
                                    Batal
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 text-sm text-green-700">
                        Produk yang sudah diulas:
                        <ul className="list-disc ml-5">
                          {selectedOrder &&
                            Array.isArray(selectedOrder.items) &&
                            selectedOrder.items
                              .filter(item =>
                                ulasanList.find(
                                  u =>
                                    u.product_id === item.product_id &&
                                    u.user_id === user?.id &&
                                    u.order_id === selectedOrder.id
                                )
                              )
                              .map(item => (
                                <li key={item.product_id}>{item.nama}</li>
                              ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Tampilkan form ulasan jika status 'diterima' atau 'selesai' */}
                  {(selectedOrder.status === 'diterima' || selectedOrder.status === 'selesai') && (() => {
  const itemsBelumDiulas = Array.isArray(selectedOrder.items)
    ? selectedOrder.items.filter(item =>
        !ulasanList.find(
          u =>
            u.product_id === item.product_id &&
            u.user_id === user?.id &&
            u.order_id === selectedOrder.id
        )
      )
    : [];

  if (itemsBelumDiulas.length === 0) return null; // SEMBUNYIKAN TEKS & TOMBOL

  return (
    <div className="mt-4">
      <b>Ulasi Produk yang Dibeli:</b>
      {itemsBelumDiulas.map(item => (
        <div key={item.product_id} className="mb-4 border rounded p-3">
          <div className="font-semibold">{item.nama}</div>
          <textarea
            value={ulasanProduk[item.product_id] || ""}
            onChange={e => setUlasanProduk({ ...ulasanProduk, [item.product_id]: e.target.value })}
            placeholder={`Ulasan untuk ${item.nama}`}
            className="w-full border p-2 rounded mt-2"
            disabled={sendingUlasan}
          />
          <div className="flex items-center gap-2 mt-2">
            <span>Rating:</span>
            <select
              value={ratingProduk[item.product_id] || 5}
              onChange={e => setRatingProduk({ ...ratingProduk, [item.product_id]: Number(e.target.value) })}
              className="border rounded px-2 py-1"
              disabled={sendingUlasan}
            >
              {[5,4,3,2,1].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span className="text-yellow-500">★</span>
          </div>
        </div>
      ))}

      <button
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        disabled={sendingUlasan}
        onClick={async () => {
          setSendingUlasan(true);
          for (const item of itemsBelumDiulas) {
            const ulasan = ulasanProduk[item.product_id];
            const rating = ratingProduk[item.product_id] || 5;
            if (ulasan) {
              await fetch(`/api/produk/${item.product_id}/ulasan`, {
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
          setShowHistory(false);
          setSelectedOrder(null);
          setUlasanProduk({});
          setRatingProduk({});
          fetchOrders();
          setSendingUlasan(false);
        }}
      >
        {sendingUlasan ? "Mengirim..." : "Kirim Semua Ulasan Produk"}
      </button>
    </div>
  );
})()}

                  <button
                    className="mt-4 bg-gray-400 text-white px-4 py-2 rounded"
                    onClick={() => {
                      setSelectedOrder(null);
                      setBuktiFile(null);
                      setBuktiPreview("");
                    }}
                  >
                    Kembali
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}