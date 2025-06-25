import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import ModalUploadBukti from "@/components/ModalUploadBukti";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showUploadBukti, setShowUploadBukti] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(""); // Tambahkan state baru di atas
  const [alamatPengiriman, setAlamatPengiriman] = useState("");
  const [kotaTujuan, setKotaTujuan] = useState(""); // id kota tujuan
  const [provinsiTujuan, setProvinsiTujuan] = useState("");
  const [ongkir, setOngkir] = useState(0);
  const [estimasiLoading, setEstimasiLoading] = useState(false);
  const [daftarKota, setDaftarKota] = useState([]);
  const [daftarProvinsi, setDaftarProvinsi] = useState([]);
  const [kurir, setKurir] = useState("jne");
  const [listOngkir, setListOngkir] = useState([]);

  // Ambil data keranjang
  useEffect(() => {
    fetchCart();
  }, []);

  // Ambil daftar kota dari backend (API RajaOngkir)
  useEffect(() => {
    fetch('/api/rajaongkir/kota')
      .then(res => res.json())
      .then(data => setDaftarKota(data.rajaongkir.results || []));
  }, []);

  // Ambil daftar provinsi dari backend (API RajaOngkir)
  useEffect(() => {
    fetch('/api/rajaongkir/provinsi')
      .then(res => res.json())
      .then(data => setDaftarProvinsi(data.rajaongkir.results || []));
  }, []);

  useEffect(() => {
    if (!provinsiTujuan) {
      setDaftarKota([]);
      setKotaTujuan("");
      return;
    }
    fetch(`/api/rajaongkir/kota?provinsi=${provinsiTujuan}`)
      .then(res => res.json())
      .then(data => setDaftarKota(data.rajaongkir.results || []));
  }, [provinsiTujuan]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hapus semua keranjang
  const handleClearCart = async () => {
    if (!confirm('Hapus semua produk di keranjang?')) return;
    setUpdating(true);
    await fetch('/api/cart', { method: 'DELETE' });
    await fetchCart();
    setUpdating(false);
  };

  // Hapus produk tertentu
  const handleRemoveItem = async (id) => {
    setUpdating(true);
    await fetch(`/api/cart/${id}`, { method: 'DELETE' });
    await fetchCart();
    setUpdating(false);
  };

  // Update qty produk
  const handleQtyChange = async (id, newQty) => {
    if (newQty < 1) return;
    setUpdating(true);
    await fetch(`/api/cart/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty }),
    });
    await fetchCart();
    setUpdating(false);
  };

  // Checkout handler
  const handleCheckout = async () => {
    if (!alamatPengiriman || !kotaTujuan || !ongkir) {
      alert("Alamat, kota tujuan, dan ongkir harus diisi!");
      return;
    }
    setUpdating(true);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        total: totalHarga + ongkir,
        alamat: alamatPengiriman,
        kota_id: kotaTujuan,
        ongkir
      }),
      credentials: 'include',
    });
    const data = await res.json();
    setUpdating(false);
    if (res.ok) {
      setOrderId(data.orderId);
      setShowUploadBukti(true); // Tampilkan form upload bukti
    } else {
      alert(data.error || 'Checkout gagal');
    }
  };

  // Hitung totalHarga sebelum handleCheckout
  const totalHarga = Array.isArray(cartItems)
    ? cartItems.reduce(
        (sum, item) => sum + item.harga * item.quantity,
        0
      )
    : 0;

  if (loading) {
    return <Layout>Memuat keranjang...</Layout>;
  }

  if (!Array.isArray(cartItems)) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
          <div className="text-center py-8 text-red-500">
            {cartItems.error || "Terjadi kesalahan mengambil data keranjang"}
          </div>
        </div>
      </Layout>
    );
  }

  // Cek city_id tujuan
  console.log(daftarKota.find(k => k.city_id === kotaTujuan));

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Keranjang belanja kosong</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Lanjutkan Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between mb-4">
              <Link
                href="/"
                className="px-4 py-2 border rounded hover:bg-gray-100">
                Lanjut Belanja
              </Link>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleClearCart}
                disabled={updating}
              >
                Hapus Semua Keranjang
              </button>
            </div>
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center border-b pb-4">
                <img
                  src={item.gambar}
                  alt={item.nama}
                  className="w-20 h-20 object-cover mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.nama}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating}
                    >-</button>
                    <input
                      type="number"
                      min={1}
                      max={item.stok || 99}
                      value={item.quantity}
                      onChange={e => {
                        let val = Number(e.target.value);
                        if (val > (item.stok || 99)) val = item.stok || 99;
                        if (val < 1) val = 1;
                        handleQtyChange(item.id, val);
                      }}
                      className="w-12 text-center border rounded"
                      disabled={updating}
                    />
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      onClick={() => {
                        if (item.quantity < (item.stok || 99)) {
                          handleQtyChange(item.id, item.quantity + 1);
                        }
                      }}
                      disabled={updating || item.quantity >= (item.stok || 99)}
                    >+</button>
                    <span className="text-xs text-gray-500 ml-2">
                      stok: {item.stok}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Rp{item.harga.toLocaleString('id-ID')}
                  </p>
                </div>
                <p className="font-medium mr-4">
                  Rp{(item.harga * item.quantity).toLocaleString('id-ID')}
                </p>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={updating}
                  title="Hapus produk ini"
                >
                  Hapus
                </button>
              </div>
            ))}

            <div className="mt-6 text-xl font-bold text-right">
              Total Produk: Rp{totalHarga.toLocaleString('id-ID')}
            </div>
            {ongkir > 0 && (
              <div className="text-right text-lg mb-2">
                Ongkir: Rp{ongkir.toLocaleString('id-ID')}
              </div>
            )}
            <div className="text-2xl font-bold text-right mb-4">
              Total Bayar: Rp{(totalHarga + ongkir).toLocaleString('id-ID')}
            </div>

            <div className="mt-6 mb-4 p-4 border rounded bg-gray-50">
              <label className="block font-medium mb-1">Alamat Pengiriman</label>
              <input
                type="text"
                className="w-full border p-2 rounded mb-2"
                placeholder="Masukkan alamat lengkap"
                value={alamatPengiriman}
                onChange={e => setAlamatPengiriman(e.target.value)}
                disabled={updating}
              />
              <label className="block font-medium mb-1 mt-2">Provinsi Tujuan</label>
              <select
                className="w-full border p-2 rounded mb-2"
                value={provinsiTujuan}
                onChange={e => setProvinsiTujuan(e.target.value)}
                disabled={updating}
              >
                <option value="">Pilih Provinsi</option>
                {daftarProvinsi.map(prov => (
                  <option key={prov.province_id} value={prov.province_id}>
                    {prov.province}
                  </option>
                ))}
              </select>

              <label className="block font-medium mb-1 mt-2">Kota Tujuan</label>
              <select
                className="w-full border p-2 rounded mb-2"
                value={kotaTujuan}
                onChange={e => setKotaTujuan(e.target.value)}
                disabled={updating || !provinsiTujuan}
              >
                <option value="">Pilih Kota</option>
                {daftarKota.map(kota => (
                  <option key={kota.city_id} value={kota.city_id}>
                    {kota.type} {kota.city_name}
                  </option>
                ))}
              </select>
              <label className="block font-medium mb-1 mt-2">Kurir</label>
              <select
                className="w-full border p-2 rounded mb-2"
                value={kurir}
                onChange={e => setKurir(e.target.value)}
                disabled={updating}
              >
                <option value="jne">JNE</option>
                <option value="pos">POS Indonesia</option>
                <option value="tiki">TIKI</option>
              </select>
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                onClick={async () => {
                  if (!kotaTujuan) return;
                  setEstimasiLoading(true);
                  setListOngkir([]);
                  const res = await fetch('/api/rajaongkir/ongkir', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      origin: 181, // Kendal
                      destination: kotaTujuan,
                      weight: 1000,
                      courier: kurir
                    })
                  });
                  const data = await res.json();
                  const costs = data.rajaongkir.results?.[0]?.costs || [];
                  setListOngkir(costs);
                  setOngkir(costs[0]?.cost[0]?.value || 0); // default pilih pertama
                  setEstimasiLoading(false);
                }}
                disabled={estimasiLoading || !kotaTujuan}
              >
                {estimasiLoading ? "Menghitung Ongkir..." : "Cek Estimasi Ongkir"}
              </button>
              {listOngkir.length > 0 && (
                <div className="mt-2 text-sm">
                  <label className="block font-medium mb-1">Pilih Layanan:</label>
                  <select
                    className="w-full border p-2 rounded mb-2"
                    value={ongkir}
                    onChange={e => setOngkir(Number(e.target.value))}
                  >
                    {listOngkir.map((layanan, idx) => (
                      <option key={idx} value={layanan.cost[0].value}>
                        {layanan.service} - {layanan.description} (Rp{layanan.cost[0].value.toLocaleString('id-ID')}, estimasi {layanan.cost[0].etd} hari)
                      </option>
                    ))}
                  </select>
                  <div>
                    Estimasi Ongkir: <b>Rp{ongkir.toLocaleString('id-ID')}</b>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Link
                href="/"
                className="px-4 py-2 border rounded hover:bg-gray-100">
                Lanjut Belanja
              </Link>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleCheckout}
                disabled={updating || cartItems.length === 0}
              >
                Checkout
              </button>
            </div>

            {/* Komponen upload bukti bayar */}
            <ModalUploadBukti
              open={showUploadBukti}
              onClose={() => {
                setShowUploadBukti(false);
                setBuktiFile(null);
                setBuktiPreview("");
              }}
              totalHarga={totalHarga + ongkir} // <-- pastikan ini total akhir
              buktiFile={buktiFile}
              setBuktiFile={setBuktiFile}
              buktiPreview={buktiPreview}
              setBuktiPreview={setBuktiPreview}
              uploading={uploading}
              onUpload={async () => {
                if (!buktiFile || !orderId) return;
                setUploading(true);
                const formData = new FormData();
                formData.append('file', buktiFile);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (res.ok && data.url) {
                  await fetch(`/api/orders/${orderId}/bukti`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bukti_bayar: data.url }),
                    credentials: 'include',
                  });
                  setShowUploadBukti(false);
                  setBuktiFile(null);
                  setBuktiPreview("");
                  setSuccessMsg("Bukti pembayaran berhasil dikirim. Menunggu konfirmasi admin.");
                }
                setUploading(false);
              }}
            />

            {/* Modal sukses */}
            {successMsg && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
                  <div className="text-green-500 text-4xl mb-2">✔️</div>
                  <div className="mb-4">{successMsg}</div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      setSuccessMsg("");
                      fetchCart();
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}