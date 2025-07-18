import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [editResiId, setEditResiId] = useState(null);
  const [resiInput, setResiInput] = useState("");

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(setOrders);
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const handleKonfirmasi = async (orderId) => {
    await fetch(`/api/konfirmasi?orderId=${orderId}`, { method: 'PUT' });
    setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'diproses' } : o));
  };

  const handleBatal = async (orderId) => {
    await fetch(`/api/konfirmasi?orderId=${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batal: true }),
    });
    fetchOrders(); // refresh data dari backend
  };

  const handleInputResi = (orderId, no_resi) => {
    setEditResiId(orderId);
    setResiInput(no_resi || "");
  };

  const handleSimpanResi = async (orderId) => {
    await fetch(`/api/orders/${orderId}/resi`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ no_resi: resiInput }),
    });
    setOrders(orders =>
      orders.map(o =>
        o.id === orderId ? { ...o, status: 'dikirim', no_resi: resiInput } : o
      )
    );
    setEditResiId(null);
    setResiInput("");
  };

  const handleBatalStok = async (orderId) => {
    if (!window.confirm("Yakin ingin membatalkan pesanan karena stok habis?")) return;
    await fetch(`/api/konfirmasi?orderId=${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batal: true, alasan: "stok_habis" }),
    });
    fetchOrders(); // refresh data dari backend
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Konfirmasi Pembayaran</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alamat</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bukti</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Resi</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alasan Batal</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="px-5 py-3 whitespace-nowrap">{order.id}</td>
                <td className="px-5 py-3 whitespace-nowrap">{order.nama || order.user_id}</td>
                <td className="px-5 py-3">
                  {order.alamat}
                  <br />
                  <span className="text-xs text-gray-600">
                    {order.kota_nama}, {order.provinsi_nama}
                  </span>
                </td>
                <td className="px-5 py-3 whitespace-nowrap">Rp{order.total.toLocaleString('id-ID')}</td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {order.status === 'menunggu_konfirmasi' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>}
                  {order.status === 'diproses' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Diproses</span>}
                  {order.status === 'dikirim' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Dikirim</span>}
                  {order.status === 'batal' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Batal</span>}
                  {order.status === 'menunggu_pembayaran' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Belum Bayar</span>}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {order.bukti_bayar && (
                    <a href={order.bukti_bayar} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">Lihat</a>
                  )}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {order.status === 'dikirim' ? order.no_resi : (
                    editResiId === order.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={resiInput}
                          onChange={e => setResiInput(e.target.value)}
                          className="border px-2 py-1 rounded text-sm"
                          placeholder="No. Resi"
                        />
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                          onClick={() => handleSimpanResi(order.id)}
                        >
                          Simpan
                        </button>
                        <button
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                          onClick={() => {
                            setEditResiId(null);
                            setResiInput("");
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      order.status === 'diproses' && (
                        <button
                          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                          onClick={() => {
                            setEditResiId(order.id);
                            setResiInput(order.no_resi || "");
                          }}
                        >
                          Input Resi
                        </button>
                      )
                    )
                  )}
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-left">
                  {order.status === 'menunggu_konfirmasi' && (
                    <div className="flex space-x-2">
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => handleKonfirmasi(order.id)}
                      >
                        Konfirmasi
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => handleBatal(order.id)}
                      >
                        Batal
                      </button>
                      <button
                        className="bg-gray-400 hover:bg-gray-500 text-gray-800 text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => handleBatalStok(order.id)}
                      >
                        Stok Habis
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {order.status === 'batal' && (
                    <span className="text-sm italic text-gray-500">
                      {order.alasan_batal === 'stok_habis' ? 'Stok Habis' : 'Dibatalkan'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}