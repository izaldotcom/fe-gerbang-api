"use client";
import { useState, useEffect, Fragment } from "react";
import Modal from "@/app/components/Modal";
import { apiService } from "@/services/api";

export default function RecipesPage() {
  // State Data
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // List Supplier untuk Grid
  const [isLoading, setIsLoading] = useState(true);

  // State Filter (ID Supplier Terpilih)
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  // State Accordion
  const [expandedIds, setExpandedIds] = useState({});

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit_qty' | 'manage'
  const [currentId, setCurrentId] = useState(null);

  // State Khusus Manage
  const [currentProductId, setCurrentProductId] = useState(null);
  const [manageItems, setManageItems] = useState([]);

  // Form State
  const initialForm = {
    product_id: "",
    supplier_product_id: "",
    quantity: "",
  };
  const [formData, setFormData] = useState(initialForm);

  // === HELPER UI ===
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (id) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
    ];
    const index = id ? id.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // === 1. FETCH DATA ===
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [recipesRes, productsRes, supplierProdRes, suppliersRes] =
        await Promise.all([
          apiService.getRecipes(),
          apiService.getProducts(),
          apiService.getSupplierProducts(),
          apiService.getSuppliers(),
        ]);

      setRecipes(recipesRes.data || []);
      setProducts(productsRes.data || []);
      setSupplierProducts(supplierProdRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === 2. LOGIKA FILTER ===
  // Filter Resep: Hanya tampilkan resep dari Produk yang dimiliki oleh Supplier terpilih
  const filteredRecipes = selectedSupplierId
    ? recipes.filter((group) => {
        // Cari data produk asli untuk cek supplier_id-nya
        const product = products.find((p) => p.id === group.product_id);
        return product && product.supplier_id === selectedSupplierId;
      })
    : []; // Default KOSONG jika belum pilih supplier

  // === 3. UI LOGIC ===
  const toggleExpand = (productId) => {
    setExpandedIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // === 4. SUBMIT HANDLER ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "manage") {
        // Manage All
        const validItems = manageItems
          .filter((item) => item.supplier_product_id && item.quantity > 0)
          .map((item) => ({
            supplier_product_id: item.supplier_product_id,
            quantity: Number(item.quantity),
          }));
        const payload = { product_id: currentProductId, items: validItems };
        await apiService.replaceRecipe(payload);
        setExpandedIds((prev) => ({ ...prev, [currentProductId]: true }));
      } else if (modalMode === "edit_qty") {
        // Edit Single Qty
        const payload = { id: currentId, quantity: Number(formData.quantity) };
        await apiService.updateRecipeItem(payload);
      } else {
        // Create Single
        const payload = {
          product_id: formData.product_id,
          items: [
            {
              supplier_product_id: formData.supplier_product_id,
              quantity: Number(formData.quantity),
            },
          ],
        };
        await apiService.createRecipe(payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus bahan baku ini dari resep?")) {
      try {
        await apiService.deleteRecipe(id);
        fetchData();
      } catch (err) {
        alert(`Gagal menghapus: ${err.message}`);
      }
    }
  };

  // === 5. MODAL HANDLERS ===
  const handleOpenAddGlobal = () => {
    setModalMode("create");
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenManage = (e, group) => {
    e.stopPropagation();
    setModalMode("manage");
    setCurrentProductId(group.product_id);
    const items = group.items.map((item) => ({
      temp_id: item.id || Math.random(),
      supplier_product_id: item.supplier_product_id,
      quantity: item.quantity,
    }));
    setManageItems(items);
    setIsModalOpen(true);
  };

  const handleOpenEditQty = (item) => {
    setModalMode("edit_qty");
    setCurrentId(item.id);
    setFormData({ ...initialForm, quantity: item.quantity });
    setIsModalOpen(true);
  };

  // Helper Manage Modal
  const handleManageChange = (index, field, value) => {
    const newItems = [...manageItems];
    newItems[index][field] = value;
    setManageItems(newItems);
  };
  const handleAddItemRow = () => {
    setManageItems([
      ...manageItems,
      { temp_id: Math.random(), supplier_product_id: "", quantity: 1 },
    ]);
  };
  const handleRemoveItemRow = (index) => {
    const newItems = [...manageItems];
    newItems.splice(index, 1);
    setManageItems(newItems);
  };

  return (
    <div className="max-w-7xl mx-auto text-gray-900 pb-20">
      {/* HEADER PAGE */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Product Recipes</h1>
        <p className="text-gray-500 mt-1">
          Pilih supplier di bawah untuk mengelola komposisi produknya.
        </p>
      </div>

      {/* === GRID FILTER BY SUPPLIER === */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4 h-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Filter by Supplier
          </h2>
          {selectedSupplierId && (
            <button
              onClick={() => setSelectedSupplierId("")}
              className="group flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold transition-all hover:bg-red-100 hover:pr-2 hover:shadow-sm animate-in fade-in slide-in-from-left-2 duration-300"
            >
              <span>Reset</span>
              <span className="bg-red-200 text-red-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] group-hover:bg-red-300 transition-colors">
                ✕
              </span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {suppliers.map((s) => {
            const isActive = selectedSupplierId === s.id;
            return (
              <div
                key={s.id}
                onClick={() =>
                  setSelectedSupplierId((prev) => (prev === s.id ? "" : s.id))
                }
                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group select-none
                  ${
                    isActive
                      ? "border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600"
                      : "border-gray-100 bg-white hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1"
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm transition-transform ${
                    isActive ? "scale-110" : ""
                  } ${getAvatarColor(s.id)}`}
                >
                  {getInitials(s.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold truncate transition-colors ${
                      isActive ? "text-indigo-900" : "text-gray-700"
                    }`}
                  >
                    {s.name}
                  </h3>
                  <p
                    className={`text-xs font-mono truncate transition-colors ${
                      isActive ? "text-indigo-600" : "text-gray-400"
                    }`}
                  >
                    {s.code}
                  </p>
                </div>
                {isActive && (
                  <div className="absolute top-[-10px] right-[-10px] text-white bg-indigo-600 rounded-full p-1 shadow-md border-2 border-white scale-100 animate-in zoom-in duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* HEADER TABEL & BUTTON ADD */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {selectedSupplierId ? (
            <>
              <span>📜 Resep Produk dari</span>
              <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-4">
                {suppliers.find((s) => s.id === selectedSupplierId)?.name}
              </span>
            </>
          ) : (
            "Daftar Resep Produk"
          )}
        </h2>

        {/* Tombol Add (Hanya Muncul Jika Supplier Dipilih) */}
        {selectedSupplierId && (
          <button
            onClick={handleOpenAddGlobal}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg shadow-lg hover:bg-indigo-700 transition-all font-medium flex items-center gap-2"
          >
            <span>+</span> Tambah Resep
          </button>
        )}
      </div>

      {/* === TABLE LIST === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-600">
                <th className="p-5 font-semibold">
                  Produk Utama (Klik untuk Detail)
                </th>
                <th className="p-5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="2" className="p-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : !selectedSupplierId ? (
                /* STATE KOSONG JIKA BELUM PILIH SUPPLIER */
                <tr>
                  <td colSpan="2" className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                        👆
                      </div>
                      <p className="font-medium">
                        Pilih salah satu supplier di atas untuk melihat resep
                        produk.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecipes.length === 0 ? (
                /* STATE JIKA SUDAH PILIH TAPI DATA KOSONG */
                <tr>
                  <td colSpan="2" className="p-16 text-center text-gray-400">
                    Belum ada resep untuk produk supplier ini.
                  </td>
                </tr>
              ) : (
                filteredRecipes.map((group) => {
                  const isExpanded = expandedIds[group.product_id];

                  return (
                    <Fragment key={group.product_id}>
                      <tr
                        onClick={() => toggleExpand(group.product_id)}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                          isExpanded ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? "rotate-90 text-indigo-600" : ""
                              }`}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                              />
                            </svg>
                            <div>
                              <span className="font-bold text-lg text-gray-800">
                                {group.product_name}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {group.items?.length || 0} Bahan Baku Terdaftar
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={(e) => handleOpenManage(e, group)}
                            className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all"
                          >
                            Update Bahan Baku
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td
                            colSpan="2"
                            className="p-0 border-t border-gray-100"
                          >
                            <div className="bg-slate-50 p-4 pl-12 space-y-2">
                              <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">
                                <div className="col-span-6">
                                  Nama Bahan Baku
                                </div>
                                <div className="col-span-2 text-center">
                                  Qty
                                </div>
                                <div className="col-span-4 text-right">
                                  Opsi
                                </div>
                              </div>
                              {group.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="grid grid-cols-12 items-center bg-white border border-gray-200 p-3 rounded-lg shadow-sm"
                                >
                                  <div className="col-span-6 flex flex-col">
                                    <span className="font-medium text-gray-700">
                                      {item.supplier_product_name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      ID:{" "}
                                      {item.supplier_product_id.substring(0, 8)}
                                      ...
                                    </span>
                                  </div>
                                  <div className="col-span-2 text-center">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                      x {item.quantity}
                                    </span>
                                  </div>
                                  <div className="col-span-4 text-right space-x-2">
                                    <button
                                      onClick={() => handleOpenEditQty(item)}
                                      className="text-sm text-indigo-600 hover:underline"
                                    >
                                      Edit Qty
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="text-sm text-red-500 hover:underline"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UNIVERSAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "manage"
            ? "Kelola Bahan Baku"
            : modalMode === "edit_qty"
            ? "Update Quantity"
            : "Resep Baru"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-gray-900">
          {/* MODE MANAGE (Update Full Resep) */}
          {modalMode === "manage" && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-2">
                Atur seluruh komposisi bahan baku untuk produk ini.
              </div>
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
                {manageItems.map((item, index) => (
                  <div
                    key={item.temp_id}
                    className="flex gap-2 items-start border p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-bold text-gray-500">
                        Bahan Baku
                      </label>
                      <select
                        className="w-full border p-2 rounded text-sm outline-none focus:border-indigo-500"
                        value={item.supplier_product_id}
                        onChange={(e) =>
                          handleManageChange(
                            index,
                            "supplier_product_id",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">-- Pilih --</option>
                        {supplierProducts.map((sp) => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name} - Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(sp.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-xs font-bold text-gray-500">
                        Qty
                      </label>
                      <input
                        type="number"
                        className="w-full border p-2 rounded text-sm outline-none focus:border-indigo-500"
                        value={item.quantity}
                        onChange={(e) =>
                          handleManageChange(index, "quantity", e.target.value)
                        }
                        min="1"
                        required
                      />
                    </div>
                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        className="text-red-500 hover:bg-red-100 p-2 rounded transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition font-medium"
              >
                + Tambah Baris Bahan
              </button>
            </div>
          )}

          {/* MODE CREATE (Single Item) */}
          {modalMode === "create" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produk Utama
                </label>
                <select
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  required
                  value={formData.product_id}
                  onChange={(e) =>
                    setFormData({ ...formData, product_id: e.target.value })
                  }
                >
                  <option value="">-- Pilih Produk --</option>
                  {/* Filter Produk di Dropdown agar hanya menampilkan produk milik Supplier yang dipilih */}
                  {products
                    .filter((p) => p.supplier_id === selectedSupplierId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
                {/* Info Text */}
                <p className="text-xs text-indigo-600 mt-1">
                  Menampilkan produk milik:{" "}
                  <b>
                    {suppliers.find((s) => s.id === selectedSupplierId)?.name}
                  </b>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bahan Baku
                </label>
                <select
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  required
                  value={formData.supplier_product_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supplier_product_id: e.target.value,
                    })
                  }
                >
                  <option value="">-- Pilih Bahan Baku --</option>
                  {supplierProducts.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qty
                </label>
                <input
                  type="number"
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {/* MODE EDIT QTY */}
          {modalMode === "edit_qty" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
