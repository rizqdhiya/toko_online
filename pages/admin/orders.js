import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";

// Komponen Modal untuk menampilkan detail item pesanan
const OrderItemsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Detail Pesanan #{order.id}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">&times;</button>
        </div>
        
        <div className="mb-4 text-sm">
            <p><span className="font-semibold">Pelanggan:</span> {order.nama}</p>
            <p><span className="font-semibold">Tanggal:</span> {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            <p><span className="font-semibold">Alamat:</span> {order.alamat}</p>
        </div>

        <div className="flex-grow overflow-y-auto border-t border-b py-4">
          <h3 className="font-semibold text-lg mb-3 text-gray-700">Barang yang Dipesan:</h3>
          <ul className="space-y-4">
            {order.items && order.items.map(item => (
              <li key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={item.gambar || '/default-product.png'} 
                    alt={item.nama} 
                    className="w-16 h-16 object-cover rounded-lg mr-4 border" 
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{item.nama}</p>
                    {item.variant_nama && <p className="text-sm text-gray-500">Varian: {item.variant_nama}</p>}
                    <p className="text-sm text-gray-600">{item.qty} x Rp{item.harga.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <p className="font-bold text-gray-800">Rp{(item.harga * item.qty).toLocaleString('id-ID')}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-right mt-4 pt-4 border-t">
            <p className="text-lg font-bold">Total Pesanan: Rp{order.total.toLocaleString('id-ID')}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [editResiId, setEditResiId] = useState(null);
  const [resiInput, setResiInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // State untuk modal

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    if (res.ok) {
        const data = await res.json();
        setOrders(data);
    }
  };

  const handleShowItems = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleKonfirmasi = async (orderId) => {
    await fetch(`/api/konfirmasi?orderId=${orderId}`, { method: 'PUT' });
    fetchOrders();
  };

  const handleBatal = async (orderId) => {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    await fetch(`/api/konfirmasi?orderId=${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batal: true }),
    });
    fetchOrders();
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
    setEditResiId(null);
    setResiInput("");
    fetchOrders();
  };

  const handleBatalStok = async (orderId) => {
    if (!window.confirm("Yakin ingin membatalkan pesanan karena stok habis?")) return;
    await fetch(`/api/konfirmasi?orderId=${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batal: true, alasan: "stok_habis" }),
    });
    fetchOrders();
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
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">No. HP</th>
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
                <td className="px-5 py-3 whitespace-nowrap">
                  <button onClick={() => handleShowItems(order)} className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold">
                    {order.nama || `User ID: ${order.user_id}`}
                  </button>
                </td>
                <td className="px-5 py-3 whitespace-nowrap">{order.no_hp || '-'}</td>
                <td className="px-5 py-3 text-sm">{order.alamat}</td>
                <td className="px-5 py-3 whitespace-nowrap">Rp{order.total.toLocaleString('id-ID')}</td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {/* Status badges */}
                  {order.status === 'menunggu_konfirmasi' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>}
                  {order.status === 'diproses' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Diproses</span>}
                  {order.status === 'dikirim' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Dikirim</span>}
                  {order.status === 'batal' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Batal</span>}
                  {order.status === 'menunggu_pembayaran' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Belum Bayar</span>}
                  {order.status === 'selesai' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Selesai</span>}
                  {order.status === 'diterima' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">Diterima</span>}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {order.bukti_bayar && (
                    <a href={order.bukti_bayar} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">Lihat</a>
                  )}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {editResiId === order.id ? (
                      <div className="flex gap-2">
                        <input type="text" value={resiInput} onChange={e => setResiInput(e.target.value)} className="border px-2 py-1 rounded text-sm" placeholder="No. Resi" />
                        <button className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded" onClick={() => handleSimpanResi(order.id)}>Simpan</button>
                        <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-bold py-1 px-2 rounded" onClick={() => setEditResiId(null)}>Batal</button>
                      </div>
                    ) : (
                      order.no_resi || (order.status === 'diproses' && <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xs font-bold py-1 px-2 rounded" onClick={() => handleInputResi(order.id, order.no_resi)}>Input Resi</button>)
                    )
                  }
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-left">
                  {order.status === 'menunggu_konfirmasi' && (
                    <div className="flex space-x-2">
                      <button className="bg-green-500 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded" onClick={() => handleKonfirmasi(order.id)}>Konfirmasi</button>
                      <button className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded" onClick={() => handleBatal(order.id)}>Batal</button>
                      <button className="bg-gray-400 hover:bg-gray-500 text-gray-800 text-xs font-bold py-1 px-2 rounded" onClick={() => handleBatalStok(order.id)}>Stok Habis</button>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-sm italic text-gray-500">
                  {order.alasan_batal === 'stok_habis' ? 'Stok Habis' : order.alasan_batal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OrderItemsModal order={selectedOrder} onClose={handleCloseModal} />
    </AdminLayout>
  );
}