// ModalUploadBukti.js
import { useRef } from "react";

export default function ModalUploadBukti({
  open,
  onClose,
  totalHarga,
  buktiFile,
  setBuktiFile,
  buktiPreview,
  setBuktiPreview,
  uploading,
  onUpload,
}) {
  const fileInputRef = useRef();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      // Jangan kasih onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative"
        onClick={(e) => e.stopPropagation()} // Supaya klik di dalam modal tidak bubble ke backdrop
      >
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-black text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="font-bold mb-2 text-lg text-center">
          Upload Bukti Pembayaran
        </h2>
        <p className="mb-2 text-center">
          Total: <b>Rp{totalHarga.toLocaleString("id-ID")}</b>
        </p>
        <div className="mb-4 text-center">
          <div className="font-semibold">Transfer ke Rekening:</div>
          <div className="text-lg font-bold mt-1">8715538713</div>
          <div className="text-sm">a.n. Rizq Dhiya Ulhaq</div>
          <div className="text-sm">Bank BCA</div>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="block w-full mb-2"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            setBuktiFile(file);
            setBuktiPreview(URL.createObjectURL(file));
          }}
        />
        {buktiPreview && (
          <img
            src={buktiPreview}
            className="w-40 mx-auto mt-2 rounded border"
          />
        )}
        <div className="flex gap-2 mt-4 justify-center">  
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={onClose}
          
            disabled={uploading}
          >
            Batal
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={onUpload}
            disabled={uploading || !buktiFile}
          >
            {uploading ? "Mengirim..." : "Kirim Bukti"}
          </button>
        </div>
      </div>
    </div>
  );
}