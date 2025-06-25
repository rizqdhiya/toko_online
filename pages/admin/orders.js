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
    setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'batal' } : o));
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
    setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'batal' } : o));
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Konfirmasi Pembayaran</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Alamat</th> {/* Tambahkan ini */}
            <th>Total</th>
            <th>Status</th>
            <th>Bukti</th>
            <th>Resi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.nama || order.user_id}</td>
              <td>{order.alamat}</td> {/* Tampilkan alamat */}
              <td>Rp{order.total.toLocaleString('id-ID')}</td>
              <td>{order.status}</td>
              <td>
                {order.bukti_bayar && (
                  <a href={order.bukti_bayar} target="_blank" rel="noopener noreferrer">Lihat</a>
                )}
              </td>
              <td>
                {order.status === 'dikirim'
                  ? order.no_resi
                  : (editResiId === order.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={resiInput}
                          onChange={e => setResiInput(e.target.value)}
                          className="border px-2 py-1 rounded"
                          placeholder="No. Resi"
                        />
                        <button
                          className="bg-blue-600 text-white px-2 py-1 rounded"
                          onClick={() => handleSimpanResi(order.id)}
                        >
                          Simpan
                        </button>
                        <button
                          className="bg-gray-400 text-white px-2 py-1 rounded"
                          onClick={() => {
                            setEditResiId(null);
                            setResiInput(""); // reset input saat batal
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      order.status === 'diproses' && (
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
                          onClick={() => {
                            setEditResiId(order.id);
                            setResiInput(order.no_resi || ""); // isi input dengan resi jika ada
                          }}
                        >
                          Input Resi
                        </button>
                      )
                    )
                  )
                }
              </td>
              <td>
                {order.status === 'menunggu_konfirmasi' && (
                  <>
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleKonfirmasi(order.id)}
                    >
                      Konfirmasi
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => handleBatal(order.id)}
                    >
                      Batal
                    </button>
                    <button
                      className="bg-gray-600 text-white px-2 py-1 rounded ml-2"
                      onClick={() => handleBatalStok(order.id)}
                    >
                      Batal (Stok Habis)
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}