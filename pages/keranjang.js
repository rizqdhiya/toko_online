import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import ModalUploadBukti from "@/components/ModalUploadBukti";
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showUploadBukti, setShowUploadBukti] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [alamatPengiriman, setAlamatPengiriman] = useState("");
  const [kotaTujuan, setKotaTujuan] = useState("");
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

  // Ambil daftar provinsi dari backend (API RajaOngkir)
  useEffect(() => {
    fetch('/api/rajaongkir/provinsi')
      .then(res => res.json())
      .then(data => setDaftarProvinsi(data.rajaongkir.results || []));
  }, []);

  // Ambil daftar kota berdasarkan provinsi
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
        ongkir,
        provinsi_id: provinsiTujuan
      }),
      credentials: 'include',
    });
    const data = await res.json();
    setUpdating(false);
    if (res.ok) {
      setOrderId(data.orderId);
      setShowUploadBukti(true);
    } else {
      alert(data.error || 'Checkout gagal');
    }
  };

  const totalHarga = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + item.harga * item.quantity, 0)
    : 0;

  if (loading) {
    return <Layout><div className="text-center p-10">Memuat keranjang...</div></Layout>;
  }

  if (!Array.isArray(cartItems)) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
          <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
            {cartItems.error || "Terjadi kesalahan mengambil data keranjang"}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Keranjang Belanja</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keranjang Anda kosong</h3>
              <p className="mt-1 text-sm text-gray-500">Ayo temukan produk favoritmu!</p>
              <div className="mt-6">
                <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Lanjutkan Belanja
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Daftar Produk di Keranjang */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Produk ({cartItems.length})</h2>
                    <button
                        onClick={handleClearCart}
                        disabled={updating}
                        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400"
                    >
                        Hapus Semua
                    </button>
                </div>
                <ul role="list" className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex py-6">
                      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                        <img src={item.gambar} alt={item.nama} className="w-full h-full object-center object-cover" />
                      </div>
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.nama}</h3>
                            <p className="ml-4">Rp{(item.harga * item.quantity).toLocaleString('id-ID')}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Rp{item.harga.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button onClick={() => handleQtyChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || updating} className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-50"><FiMinus /></button>
                            <input type="text" value={item.quantity} readOnly className="w-10 text-center border-l border-r" />
                            <button onClick={() => { if (item.quantity < (item.stok || 99)) { handleQtyChange(item.id, item.quantity + 1); } }} disabled={updating || item.quantity >= (item.stok || 99)} className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-50"><FiPlus /></button>
                          </div>
                          <div className="flex">
                            <button onClick={() => handleRemoveItem(item.id)} type="button" className="font-medium text-red-600 hover:text-red-800 flex items-center gap-1">
                              <FiTrash2 />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ringkasan & Pengiriman */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Alamat Pengiriman</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                      <textarea id="alamat" rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Masukkan alamat lengkap" value={alamatPengiriman} onChange={e => setAlamatPengiriman(e.target.value)} disabled={updating} />
                    </div>
                    <div>
                      <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700">Provinsi</label>
                      <select id="provinsi" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={provinsiTujuan} onChange={e => setProvinsiTujuan(e.target.value)} disabled={updating}>
                        <option value="">Pilih Provinsi</option>
                        {daftarProvinsi.map(prov => <option key={prov.province_id} value={prov.province_id}>{prov.province}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="kota" className="block text-sm font-medium text-gray-700">Kota/Kabupaten</label>
                      <select id="kota" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={kotaTujuan} onChange={e => setKotaTujuan(e.target.value)} disabled={updating || !provinsiTujuan}>
                        <option value="">Pilih Kota/Kabupaten</option>
                        {daftarKota.map(kota => <option key={kota.city_id} value={kota.city_id}>{kota.type} {kota.city_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="kurir" className="block text-sm font-medium text-gray-700">Kurir</label>
                      <select id="kurir" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={kurir} onChange={e => setKurir(e.target.value)} disabled={updating}>
                        <option value="jne">JNE</option>
                        <option value="pos">POS Indonesia</option>
                        <option value="tiki">TIKI</option>
                      </select>
                    </div>
                    <button type="button" className="w-full text-sm bg-blue-50 text-blue-700 font-medium py-2 px-4 rounded-md hover:bg-blue-100 disabled:opacity-50" onClick={async () => { if (!kotaTujuan) return; setEstimasiLoading(true); setListOngkir([]); const res = await fetch('/api/rajaongkir/ongkir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origin: 181, destination: kotaTujuan, weight: 1000, courier: kurir }) }); const data = await res.json(); const costs = data.rajaongkir.results?.[0]?.costs || []; setListOngkir(costs); setOngkir(costs[0]?.cost[0]?.value || 0); setEstimasiLoading(false); }} disabled={estimasiLoading || !kotaTujuan}>
                      {estimasiLoading ? "Menghitung..." : "Cek Estimasi Ongkir"}
                    </button>
                    {listOngkir.length > 0 && (
                      <div>
                        <label htmlFor="layanan" className="block text-sm font-medium text-gray-700">Pilih Layanan</label>
                        <select id="layanan" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={ongkir} onChange={e => setOngkir(Number(e.target.value))}>
                          {listOngkir.map((layanan, idx) => <option key={idx} value={layanan.cost[0].value}>{layanan.service} - {layanan.description} (Rp{layanan.cost[0].value.toLocaleString('id-ID')})</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Pesanan</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal Produk</span>
                      <span>Rp{totalHarga.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Ongkos Kirim</span>
                      <span>Rp{ongkir.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                      <p>Total Pembayaran</p>
                      <p>Rp{(totalHarga + ongkir).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button onClick={handleCheckout} disabled={updating || cartItems.length === 0 || !ongkir} className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalUploadBukti
        open={showUploadBukti}
        onClose={async () => {
          setShowUploadBukti(false);
          setBuktiFile(null);
          setBuktiPreview("");
          await fetch('/api/cart', { method: 'DELETE' });
          setSuccessMsg("Checkout berhasil! Silakan selesaikan pembayaran dan upload bukti pada halaman profil di menu Riwayat Pesanan.");
          fetchCart();
        }}
        totalHarga={totalHarga + ongkir}
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
            await fetch('/api/cart', { method: 'DELETE' });
            fetchCart();
          }
          setUploading(false);
        }}
      />

      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSuccessMsg("")}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <div className="text-green-500 text-5xl mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="mb-4 text-gray-700">{successMsg}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md" onClick={() => { setSuccessMsg(""); }}>
              OK
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
