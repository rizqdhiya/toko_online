import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import ModalUploadBukti from "@/components/ModalUploadBukti";
import { FiTrash2, FiPlus, FiMinus, FiLoader } from 'react-icons/fi';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash.debounce';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [alamatPengiriman, setAlamatPengiriman] = useState("");
  const [areaTujuan, setAreaTujuan] = useState(null);
  const [listOngkir, setListOngkir] = useState([]);
  const [ongkirTerpilih, setOngkirTerpilih] = useState(null);
  const [estimasiLoading, setEstimasiLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // State untuk modal
  const [showUploadBukti, setShowUploadBukti] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat keranjang.");
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch cart error:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantityOnServer = useCallback(debounce(async (id, newQty) => {
    setUpdatingItemId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Gagal update: ${data.error}`);
        await fetchCart();
      } else {
        window.dispatchEvent(new Event('cartUpdate'));
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      await fetchCart();
    } finally {
      setUpdatingItemId(null);
    }
  }, 500), [fetchCart]);

  const handleQtyChange = (id, stok, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1 || newQty > stok || updatingItemId) return;

    setCartItems(items => items.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    updateQuantityOnServer(id, newQty);
  };

  const handleManualQtyChange = (id, stok, value) => {
    if (updatingItemId) return;
    setCartItems(items => items.map(item => {
      if (item.id === id) {
        if (value === '') return { ...item, quantity: '' };

        let newQty = parseInt(value.replace(/[^0-9]/g, ''));
        if (isNaN(newQty)) return item; // Abaikan jika bukan angka
        if (newQty > stok) newQty = stok;
        if (newQty < 1) newQty = 1;

        updateQuantityOnServer(id, newQty);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = async (id) => {
    setUpdatingItemId(id);
    try {
      await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdate'));
    } catch (error) {
      alert("Gagal menghapus item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Anda yakin ingin mengosongkan keranjang?')) return;
    setLoading(true);
    await fetch('/api/cart', { method: 'DELETE' });
    await fetchCart();
    window.dispatchEvent(new Event('cartUpdate'));
    setLoading(false);
  };

  const loadOptions = (inputValue, callback) => {
    if (!inputValue || inputValue.length < 3) return callback([]);
    fetch(`/api/biteship/search-area?q=${inputValue}`)
      .then(res => res.json())
      .then(data => callback(data))
      .catch(() => callback([]));
  };

  const debouncedLoadOptions = useCallback(debounce(loadOptions, 500), []);

  const handleAreaChange = (selectedOption) => {
    setAreaTujuan(selectedOption);
    setListOngkir([]);
    setOngkirTerpilih(null);
  };

  useEffect(() => {
    if (!areaTujuan?.value || cartItems.length === 0) {
      setListOngkir([]);
      setOngkirTerpilih(null);
      return;
    }

    const fetchOngkir = async () => {
      setEstimasiLoading(true);
      setListOngkir([]);
      setOngkirTerpilih(null);

      const totalBerat = cartItems.reduce((sum, item) => {
        const qty = isNaN(item.quantity) || item.quantity === '' ? 0 : item.quantity;
        const beratPerItem = item.berat || 100;
        return sum + beratPerItem * qty;
      }, 0);
      const finalWeight = totalBerat > 0 ? totalBerat : 100;

      try {
        const res = await fetch('/api/biteship/ongkir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination_area_id: areaTujuan.value,
            weight: finalWeight,
            couriers: "jne,jnt,sicepat,anteraja,tiki",
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal cek ongkir");
        setListOngkir(data);
        if (data.length > 0) setOngkirTerpilih(data[0]);
      } catch (error) {
        alert(error.message);
      } finally {
        setEstimasiLoading(false);
      }
    };
    
    const debouncedFetch = debounce(fetchOngkir, 300);
    debouncedFetch();

    return () => debouncedFetch.cancel();
  }, [areaTujuan?.value, JSON.stringify(cartItems.map(i => i.quantity))]);

  const totalHarga = cartItems.reduce((sum, item) => {
    const qty = isNaN(item.quantity) || item.quantity === '' ? 0 : item.quantity;
    return sum + item.harga * qty;
  }, 0);
  const ongkirValue = ongkirTerpilih ? ongkirTerpilih.price : 0;

  const handleCheckout = async () => {
    if (!alamatPengiriman || !areaTujuan || !ongkirTerpilih) {
      alert("Alamat lengkap, kota tujuan, dan layanan ongkir harus dipilih!");
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          total: totalHarga + ongkirValue,
          alamat: alamatPengiriman,
          kota_nama: areaTujuan.label,
          ongkir: ongkirValue,
          layanan_ongkir: `${ongkirTerpilih.courier_name} - ${ongkirTerpilih.courier_service_name}`
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout gagal');
      setOrderId(data.orderId);
      setShowUploadBukti(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <Layout><div className="flex justify-center items-center h-screen"><FiLoader className="animate-spin h-8 w-8 text-blue-600" /></div></Layout>;

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Keranjang Belanja</h1>
          {cartItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keranjang Anda kosong</h3>
                <p className="mt-1 text-sm text-gray-500">Ayo temukan produk favoritmu!</p>
                <div className="mt-6">
                    <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Lanjutkan Belanja</Link>
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 space-y-6">
                 <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Produk ({cartItems.length})</h2>
                  <button onClick={handleClearCart} disabled={!!updatingItemId || checkoutLoading} className="text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400">Hapus Semua</button>
                </div>
                 <ul role="list" className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className={`flex py-6 transition-opacity ${updatingItemId === item.id ? 'opacity-50' : 'opacity-100'}`}>
                      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                        <img src={item.gambar} alt={item.nama} className="w-full h-full object-center object-cover" />
                      </div>
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.nama}</h3>
                            <p className="ml-4">Rp{((isNaN(item.quantity) ? 0 : item.quantity) * item.harga).toLocaleString('id-ID')}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Rp{item.harga.toLocaleString('id-ID')}</p>
                          <p className="mt-1 text-xs text-gray-400">Stok Tersedia: {item.stok}</p>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button onClick={() => handleQtyChange(item.id, item.stok, item.quantity, -1)} disabled={item.quantity <= 1 || !!updatingItemId} className="p-2 disabled:opacity-50"><FiMinus /></button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={item.quantity}
                              onChange={(e) => handleManualQtyChange(item.id, item.stok, e.target.value)}
                              className="w-12 text-center border-l border-r focus:outline-none"
                              disabled={!!updatingItemId}
                            />
                            <button onClick={() => handleQtyChange(item.id, item.stok, item.quantity, 1)} disabled={item.quantity >= item.stok || !!updatingItemId} className="p-2 disabled:opacity-50"><FiPlus /></button>
                          </div>
                          <button onClick={() => handleRemoveItem(item.id)} disabled={!!updatingItemId} className="font-medium text-red-600 hover:text-red-800 flex items-center gap-1"><FiTrash2 /> <span>Hapus</span></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Alamat Pengiriman</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                        <textarea id="alamat" rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Nama Jalan, No Rumah, RT/RW, dll." value={alamatPengiriman} onChange={e => setAlamatPengiriman(e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="kota" className="block text-sm font-medium text-gray-700">Kota/Kecamatan Tujuan</label>
                        <AsyncSelect key={areaTujuan?.value} cacheOptions loadOptions={debouncedLoadOptions} defaultOptions onChange={handleAreaChange} value={areaTujuan} placeholder="Ketik min 3 huruf..." noOptionsMessage={() => 'Ketik min 3 huruf untuk mencari'} loadingMessage={() => 'Mencari...'} className="mt-1" classNamePrefix="select" />
                      </div>
                      {estimasiLoading && <div className="flex items-center justify-center text-sm text-gray-500"><FiLoader className="animate-spin mr-2" /> Menghitung ongkir...</div>}
                      {listOngkir.length > 0 && !estimasiLoading && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Pilih Layanan</label>
                            <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                            {listOngkir.map((layanan, index) => {
                                const id = `layanan-${index}`;
                                return (
                                <div key={id} className="relative flex items-start p-3 hover:bg-gray-50" onClick={() => setOngkirTerpilih(layanan)}>
                                    <div className="flex items-center h-5">
                                        <input id={id} name="layanan-pengiriman" type="radio" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-pointer"
                                            checked={ongkirTerpilih?.courier_service_code === layanan.courier_service_code && ongkirTerpilih?.courier_code === layanan.courier_code}
                                            readOnly
                                        />
                                    </div>
                                    <div className="ml-3 text-sm flex-1 cursor-pointer">
                                        <span className="font-medium text-gray-800">{layanan.courier_name} - {layanan.courier_service_name}</span>
                                        <p className="text-gray-500">Estimasi {layanan.duration}</p>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">Rp{layanan.price.toLocaleString('id-ID')}</div>
                                </div>);
                            })}
                            </div>
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
                        <span>Rp{ongkirValue.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                        <p>Total Pembayaran</p>
                        <p>Rp{(totalHarga + ongkirValue).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                     <div className="mt-6">
                      <button onClick={handleCheckout} disabled={checkoutLoading || cartItems.length === 0 || !ongkirTerpilih || !!updatingItemId} className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center">
                        {checkoutLoading ? <FiLoader className="animate-spin h-5 w-5" /> : 'Checkout'}
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
        <ModalUploadBukti open={showUploadBukti} onClose={async () => {
          setShowUploadBukti(false);
          setBuktiFile(null); setBuktiPreview("");
          await fetch('/api/cart', { method: 'DELETE' });
          setSuccessMsg("Checkout berhasil! Silakan upload bukti pembayaran di menu Riwayat Pesanan.");
          fetchCart();
          window.dispatchEvent(new Event('cartUpdate'));
        }} totalHarga={totalHarga + ongkirValue} buktiFile={buktiFile} setBuktiFile={setBuktiFile} buktiPreview={buktiPreview} setBuktiPreview={setBuktiPreview} uploading={uploading} onUpload={async () => {
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
            setSuccessMsg("Bukti pembayaran berhasil dikirim. Menunggu konfirmasi admin.");
            await fetchCart();
            window.dispatchEvent(new Event('cartUpdate'));
          } else {
              alert("Gagal mengupload bukti pembayaran.");
          }
          setUploading(false);
        }}/>
        {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSuccessMsg("")}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-green-500 text-5xl mb-3"><svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <p className="mb-4 text-gray-700">{successMsg}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md" onClick={() => setSuccessMsg("")}>OK</button>
          </div>
        </div>
      )}
    </Layout>
  );
}