"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import Modal from "@/app/components/Modal";

export default function TransactionPage() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // State untuk list Supplier
  const [isLoading, setIsLoading] = useState(false);

  // State Form (Ditambah supplier_id)
  const [formData, setFormData] = useState({
    supplier_id: "",
    product_id: "",
    destination: "",
    ref_id: "",
  });

  // State Modal Sukses
  const [successData, setSuccessData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // 1. Fetch Data (Suppliers & Products) saat halaman dimuat
  useEffect(() => {
    generateRefId();
    fetchData();
  }, []);

  const generateRefId = () => {
    const uniqueId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setFormData((prev) => ({ ...prev, ref_id: uniqueId }));
  };

  const fetchData = async () => {
    try {
      // Ambil data Supplier dan Product secara bersamaan
      const [suppliersRes, productsRes] = await Promise.all([
        apiService.getSuppliers(),
        apiService.getProducts(),
      ]);

      setSuppliers(suppliersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
    }
  };

  // 2. Submit Order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Payload otomatis berisi supplier_id, product_id, destination, ref_id
      const response = await apiService.createOrder(formData);

      setSuccessData(response);
      setIsSuccessModalOpen(true);

      // Reset form (kecuali Ref ID)
      setFormData({
        supplier_id: "",
        product_id: "",
        destination: "",
        ref_id: "",
      });
    } catch (err) {
      alert(`Transaksi Gagal: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessData(null);
    generateRefId();
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Buat Transaksi</h1>
          <p className="text-gray-500 mt-1">
            Proses order pembelian produk manual.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Input Supplier (Dropdown) - BARU */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Pilih Supplier
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                required
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
              >
                <option value="">-- Silakan Pilih Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Input Product (Dropdown) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Pilih Produk
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                required
                value={formData.product_id}
                onChange={(e) =>
                  setFormData({ ...formData, product_id: e.target.value })
                }
              >
                <option value="">-- Silakan Pilih Produk --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - Rp{" "}
                    {new Intl.NumberFormat("id-ID").format(p.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Input Destination */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ID Tujuan / Destination
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-300"
                placeholder="Contoh: 3145526"
                required
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
              />
              <p className="text-xs text-gray-400 mt-1">
                Masukkan ID Game atau Nomor Tujuan pelanggan.
              </p>
            </div>

            {/* 4. Input Ref ID */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ref ID (Auto Generated)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 font-mono focus:outline-none cursor-not-allowed"
                  readOnly
                  value={formData.ref_id}
                />
                <button
                  type="button"
                  onClick={generateRefId}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 text-sm font-medium transition"
                  title="Generate ID Baru"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30"
                }`}
              >
                {isLoading
                  ? "Memproses Pesanan..."
                  : "Kirim Pesanan Sekarang 🚀"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Sukses */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title="🎉 Transaksi Berhasil!"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>

          <h3 className="text-xl font-bold text-gray-800">
            Order Processed Successfully
          </h3>

          <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2 border border-gray-100 text-sm">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">TRX ID:</span>
              <span className="font-mono font-bold text-gray-800">
                {successData?.trx_id}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Produk:</span>
              <span className="font-semibold text-gray-800">
                {successData?.product}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Status:</span>
              <span className="font-bold text-green-600 uppercase">
                {successData?.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Quantity Loop:</span>
              <span className="font-semibold text-gray-800">
                {successData?.quantity_loop}
              </span>
            </div>
          </div>

          <button
            onClick={closeSuccessModal}
            className="w-full bg-gray-800 text-white py-2.5 rounded-lg hover:bg-gray-900 transition font-medium mt-4"
          >
            Tutup & Buat Transaksi Baru
          </button>
        </div>
      </Modal>
    </div>
  );
}
