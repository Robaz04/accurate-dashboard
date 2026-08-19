"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// =========================================================
// Interface
// =========================================================

interface Item {
  id: number;
  accurate_id: number;
  item_no: string | null;
  item_type: string | null;
  available_to_sell: string;
  name: string | null;
  upc_no: string | null;
}

interface ItemOption {
  item_no: string;
  name: string;
}

interface InvoiceItem {
  id: number;
  itemNo: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  description: string;
  _status?: "delete";
}

// =========================================================
// Page
// =========================================================

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();

  const invoiceId = params.id;

  // =========================================================
  // Invoice
  // =========================================================

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerNo, setCustomerNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [transDate, setTransDate] = useState("");

  // =========================================================
  // Loading
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // =========================================================
  // Invoice Items
  // =========================================================

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // State untuk menyimpan item yang dihapus dari invoice, agar bisa dikirim ke backend untuk dihapus dari Accurate
  const [deletedItems, setDeletedItems] = useState<InvoiceItem[]>([]);

  // =========================================================
  // Search Item
  // =========================================================

  const [itemSearch, setItemSearch] = useState("");
  const [itemResults, setItemResults] = useState<ItemOption[]>([]);

  const [showItemResults, setShowItemResults] = useState(false);

  // =========================================================
  // Modal
  // =========================================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");

  // =========================================================
  // Fetch Invoice Detail
  // =========================================================

  useEffect(() => {
    if (!invoiceId) {
      return;
    }

    const fetchInvoice = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/sales-invoice/detail?id=${invoiceId}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        console.log("Invoice Detail:", result);

        if (!result.s || !result.d) {
          throw new Error("Data invoice tidak ditemukan");
        }

        const invoice = result.d;

        // =================================================
        // Basic Invoice Data
        // =================================================

        setInvoiceNumber(invoice.number || "");

        setCustomerNo(invoice.customer?.customerNo || "");

        setCustomerName(invoice.customer?.name || "");

        setTransDate(invoice.transDate || "");

        // =================================================
        // Detail Items
        // =================================================

        const detailItems = invoice.detailItem || [];

        const mappedItems: InvoiceItem[] = detailItems.map((item: any) => ({
          id: item.id,
          itemNo: item.item?.no || "",
          itemName: item.item?.name || "",
          unitPrice: Number(item.unitPrice || 0),
          quantity: Number(item.quantity || 0),
          description: item.description || "",
        }));
        setInvoiceItems(mappedItems);
      } catch (error) {
        console.error("Fetch invoice detail error:", error);

        alert("Gagal mengambil detail invoice.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  // =========================================================
  // Search Items
  // =========================================================

  const searchItems = async (keyword: string) => {
    setItemSearch(keyword);

    if (!keyword.trim()) {
      setItemResults([]);
      setShowItemResults(false);

      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/items/search?q=${encodeURIComponent(
          keyword,
        )}`,
      );

      const result = await response.json();

      setItemResults(result.data || []);

      setShowItemResults(true);
    } catch (error) {
      console.error("Item search error:", error);
    }
  };

  // =========================================================
  // Open Add Item Modal
  // =========================================================

  const handleSelectNewItem = async (item: ItemOption) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/items/search?q=${encodeURIComponent(
          item.item_no,
        )}`,
      );

      const result = await response.json();

      const fullItem = result.data?.find(
        (i: Item) => i.item_no === item.item_no,
      );

      if (!fullItem) {
        return;
      }

      setSelectedItem(fullItem);

      setModalMode("add");

      setEditingIndex(null);

      setUnitPrice("");
      setQuantity("1");
      setDescription("");

      setItemSearch("");

      setShowItemResults(false);

      setIsModalOpen(true);
    } catch (error) {
      console.error("Get item detail error:", error);
    }
  };

  // =========================================================
  // Open Edit Item Modal
  // =========================================================

  const handleEditItem = (index: number) => {
    const item = invoiceItems[index];

    setModalMode("edit");

    setEditingIndex(index);

    setSelectedItem({
      id: item.id || 0,
      accurate_id: 0,
      item_no: item.itemNo,
      item_type: null,
      available_to_sell: "0",
      name: item.itemName,
      upc_no: null,
    });

    setUnitPrice(item.unitPrice.toString());

    setQuantity(item.quantity.toString());

    setDescription(item.description);

    setIsModalOpen(true);
  };

  // =========================================================
  // Add / Update Item
  // =========================================================

  const handleSaveItem = () => {
    if (!selectedItem) {
      return;
    }

    const price = Number(unitPrice);

    const qty = Number(quantity);

    if (!unitPrice || price < 0) {
      alert("Unit price harus diisi.");

      return;
    }

    if (!quantity || qty <= 0) {
      alert("Quantity harus lebih dari 0.");

      return;
    }

    // =====================================================
    // EDIT EXISTING ITEM
    // =====================================================

    if (modalMode === "edit" && editingIndex !== null) {
      setInvoiceItems((prev) =>
        prev.map((item, index) => {
          if (index !== editingIndex) {
            return item;
          }

          return {
            ...item,

            unitPrice: price,

            quantity: qty,

            description: description,
          };
        }),
      );
    }

    // =====================================================
    // ADD NEW ITEM
    // =====================================================
    else {
      const newItem: InvoiceItem = {
        id: selectedItem.id,
        itemNo: selectedItem.item_no || "",
        itemName: selectedItem.name || "",
        unitPrice: price,
        quantity: qty,
        description: description,
      };
      setInvoiceItems((prev) => [...prev, newItem]);
    }

    // =====================================================
    // Close Modal
    // =====================================================
    setIsModalOpen(false);
    setSelectedItem(null);
    setEditingIndex(null);
    setUnitPrice("");
    setQuantity("1");
    setDescription("");
  };

  // =========================================================
  // Remove Item
  // =========================================================

  const handleRemoveItem = (index: number) => {
    const item = invoiceItems[index];

    if (!item) {
      return;
    }

    // Kalau item sudah ada di Accurate
    // simpan untuk dikirim sebagai delete
    if (item.id) {
      setDeletedItems((prev) => [...prev, item]);
    }

    // Hilangkan dari UI
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================================================
  // Debug JSON
  // =========================================================

  const invoiceData = {
    id: Number(invoiceId),
    branchId: 50,
    number: invoiceNumber,

    customerNo: customerNo,

    transDate: transDate,

    detailItem: [
      ...invoiceItems.map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        itemNo: item.itemNo,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        description: item.description,
      })),

      ...deletedItems.map((item) => ({
        id: item.id,
        itemNo: item.itemNo,
        _status: "delete",
      })),
    ],
  };

  // =========================================================
  // Update Invoice
  // =========================================================

  const handleUpdate = async () => {
    const confirmed = window.confirm(
      "Yakin ingin mengupdate sales invoice ini?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);

      console.log("Update Invoice JSON:", JSON.stringify(invoiceData, null, 2));

      const response = await fetch("http://localhost:3001/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      console.log("UPDATE HTTP STATUS:", response.status);

      console.log("UPDATE RESPONSE:", JSON.stringify(result, null, 2));

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            result.d?.join?.("\n") ||
            "Gagal mengupdate sales invoice.",
        );

        return;
      }

      alert("Sales invoice berhasil diupdate.");

      router.push(`/${invoiceId}`);
    } catch (error) {
      console.error("Update invoice error:", error);

      alert("Terjadi kesalahan saat mengupdate invoice.");
    } finally {
      setUpdating(false);
    }
  };

  // =========================================================
  // Loading UI
  // =========================================================

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-emerald-moss font-medium">
          Memuat data invoice...
        </div>
      </div>
    );
  }

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-emerald-moss hover:text-forest-deep transition"
        >
          ← Kembali
        </button>

        <h1 className="text-3xl font-bold text-forest-deep">
          Edit Sales Invoice
        </h1>

        <p className="text-sm text-emerald-moss/80 mt-1">
          Ubah informasi dan detail barang pada invoice.
        </p>
      </div>

      {/* ================================================= */}
      {/* Invoice Information */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-forest-deep mb-5">
          Informasi Invoice
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Invoice Number */}

          <div>
            <label className="block text-sm font-semibold text-forest-deep mb-2">
              Nomor Invoice
            </label>

            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-forest-deep border-sage-mist/40 focus:outline-none focus:ring-2 focus:ring-raw-amber/30"
            />
          </div>

          {/* Customer */}

          <div>
            <label className="block text-sm font-semibold text-forest-deep mb-2">
              Customer
            </label>

            <input
              type="text"
              value={
                customerName ? `${customerNo} - ${customerName}` : customerNo
              }
              disabled
              className="w-full px-4 py-3 rounded-xl border border-sage-mist/30 bg-gray-50 text-gray-500"
            />
          </div>

          {/* Transaction Date */}

          <div>
            <label className="block text-sm font-semibold text-forest-deep mb-2">
              Tanggal Transaksi
            </label>

            <input
              type="text"
              value={transDate}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-sage-mist/30 bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* Items */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-forest-deep">
              Detail Barang
            </h2>

            <p className="text-sm text-emerald-moss/70">
              Edit atau tambahkan barang pada invoice.
            </p>
          </div>

          {/* Add Item */}

          <div className="relative w-80">
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => searchItems(e.target.value)}
              placeholder="Cari barang..."
              className="w-full px-4 py-2.5 rounded-xl border text-forest-deep border-sage-mist/40 focus:outline-none focus:ring-2 focus:ring-raw-amber/30"
            />

            {showItemResults && itemResults.length > 0 && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-sage-mist/30 rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                {itemResults.map((item) => (
                  <button
                    key={item.item_no}
                    type="button"
                    onClick={() => handleSelectNewItem(item)}
                    className="w-full text-left px-4 py-3 hover:bg-eco-white transition"
                  >
                    <div className="font-semibold text-forest-deep">
                      {item.item_no}
                    </div>

                    <div className="text-sm text-emerald-moss">{item.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}

        {invoiceItems.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Belum ada barang pada invoice.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-eco-white/60 text-forest-deep text-xs font-bold uppercase tracking-wider border-y border-sage-mist/20">
                  <th className="py-3 px-6">Item No</th>

                  <th className="py-3 px-6">Nama</th>

                  <th className="py-3 px-6">Unit Price</th>

                  <th className="py-3 px-6">Quantity</th>

                  <th className="py-3 px-6">Description</th>

                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sage-mist/20 text-sm text-forest-deep">
                {invoiceItems.map((item, index) => (
                  <tr
                    key={`${item.itemNo}-${index}`}
                    className="hover:bg-eco-white/30 transition"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-emerald-moss">
                      {item.itemNo}
                    </td>

                    <td className="py-4 px-6 font-semibold">{item.itemName}</td>

                    <td className="py-4 px-6">
                      {item.unitPrice.toLocaleString()}
                    </td>

                    <td className="py-4 px-6">{item.quantity}</td>

                    <td className="py-4 px-6 text-gray-500">
                      {item.description || "-"}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditItem(index)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-sage-mist/50 hover:bg-eco-white transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* Update Button */}
      {/* ================================================= */}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 rounded-xl border border-sage-mist/50 text-forest-deep font-semibold bg-eco-white transition cursor-pointer"
        >
          Batal
        </button>

        <button
          type="button"
          disabled={updating || invoiceItems.length === 0}
          onClick={handleUpdate}
          className="px-6 py-3 rounded-xl bg-forest-deep text-white font-semibold hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
        >
          {updating ? "Updating..." : "Update Invoice"}
        </button>
      </div>

      {/* ================================================= */}
      {/* Modal */}
      {/* ================================================= */}

      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
            {/* Modal Header */}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-forest-deep">
                  {modalMode === "edit"
                    ? "Edit Detail Barang"
                    : "Tambah Barang"}
                </h2>

                <p className="text-sm text-emerald-moss mt-1">
                  {selectedItem.item_no}

                  {" - "}

                  {selectedItem.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {/* Unit Price */}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-forest-deep mb-2">
                Unit Price
              </label>

              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                min="0"
                className="w-full px-4 py-3 rounded-xl border text-forest-deep border-sage-mist/40 focus:outline-none focus:ring-2 focus:ring-raw-amber/30"
              />
            </div>

            {/* Quantity */}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-forest-deep mb-2">
                Quantity
              </label>

              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-full px-4 py-3 rounded-xl border text-forest-deep border-sage-mist/40 focus:outline-none focus:ring-2 focus:ring-raw-amber/30"
              />
            </div>

            {/* Description */}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-forest-deep mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border text-forest-deep border-sage-mist/40 focus:outline-none focus:ring-2 focus:ring-raw-amber/30 resize-none"
              />
            </div>

            {/* Modal Buttons */}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-sage-mist/50 text-forest-deep font-semibold hover:bg-eco-white transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveItem}
                className="px-5 py-2.5 rounded-xl bg-forest-deep text-white font-semibold hover:opacity-90 transition"
              >
                {modalMode === "edit" ? "Update" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
