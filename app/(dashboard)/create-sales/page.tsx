"use client";

import { useEffect, useState } from "react";

interface InvoiceItem {
    itemNo: string;
    itemName: string;
    unitPrice: number;
    quantity: number;
    description: string;
}

interface CustomerOption {
    customer_no: string;
    name: string;
}

interface ItemOption {
    item_no: string;
    name: string;
}

export default function CreatePage() {

    // Invoice

    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [customerNo, setCustomerNo] = useState("");
    const [transDate, setTransDate] = useState("");

    // Search Customer

    const [customerSearch, setCustomerSearch] = useState("");
    const [customerResults, setCustomerResults] = useState<CustomerOption[]>([]);
    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerOption | null>(null);

    const [showCustomerResults, setShowCustomerResults] = useState(false);

    useEffect(() => {
        const keyword = customerSearch.trim();

        if (!keyword) {
            setCustomerResults([]);
            setShowCustomerResults(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    `http://localhost:3001/api/customers/search?q=${encodeURIComponent(keyword)}`
                );

                if (!response.ok) {
                    throw new Error("Gagal mencari customer");
                }

                const result = await response.json();

                setCustomerResults(result.data || []);
                setShowCustomerResults(true);

            } catch (error) {
                console.error("Customer search error:", error);
                setCustomerResults([]);
                setShowCustomerResults(false);
            }
        }, 500);

        return () => clearTimeout(timeout);

    }, [customerSearch]);

    // Search Items

    const [itemSearch, setItemSearch] = useState("");
    const [itemResults, setItemResults] = useState<ItemOption[]>([]);
    const [showItemResults, setShowItemResults] = useState(false);

    useEffect(() => {
        const keyword = itemSearch.trim();

        if (!keyword) {
            setItemResults([]);
            setShowItemResults(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    `http://localhost:3001/api/items/search?q=${encodeURIComponent(keyword)}`
                );

                if (!response.ok) {
                    throw new Error("Gagal mencari item");
                }

                const result = await response.json();

                setItemResults(result.data || []);
                setShowItemResults(true);

            } catch (error) {
                console.error("Item search error:", error);
                setItemResults([]);
                setShowItemResults(false);
            }
        }, 500);

        return () => clearTimeout(timeout);

    }, [itemSearch]);

    // Invoice detail

    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

    // Modal

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] =
        useState<ItemOption | null>(null);

    const [unitPrice, setUnitPrice] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [description, setDescription] = useState("");

    // Handle Item Select

    const handleItemSelect = (item: ItemOption) => {

        setItemSearch(
            `${item.item_no} - ${item.name}`
        );

        setShowItemResults(false);

        setSelectedItem(item);

        setUnitPrice("");
        setQuantity("1");
        setDescription("");

        setIsModalOpen(true);
    };

    // Add item to invoice

    const handleAddItem = () => {

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

        const newItem: InvoiceItem = {
            itemNo: selectedItem.item_no,
            itemName: selectedItem.name,
            unitPrice: price,
            quantity: qty,
            description,
        };

        setInvoiceItems((prev) => [
            ...prev,
            newItem,
        ]);

        setIsModalOpen(false);
        setSelectedItem(null);

        setUnitPrice("");
        setQuantity("1");
        setDescription("");

        // Reset search
        setItemSearch("");
    };

    // Remove item
    const handleRemoveItem = (index: number) => {

        setInvoiceItems((prev) =>
            prev.filter((_, i) => i !== index)
        );

    };

    const formatDate = (date: string) => {
        if (!date) return "";

        const [year, month, day] = date.split("-");

        return `${day}/${month}/${year}`;
    };

    // Debug JSON
    const invoiceData = {
        number: invoiceNumber,
        customerNo,
        transDate: formatDate(transDate),
        branchId: 50,
        detailItem: invoiceItems,
    };

    // Create
    const handleCreate = () => {
        fetch("http://localhost:3001/api/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(invoiceData)
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to create invoice.");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Invoice created:", data);
                alert("Faktur berhasil dibuat!");
            })
            .catch((error) => {
                console.error("Error creating invoice:", error);
                alert("Gagal membuat faktur.");
            });
    };

    return (
        <div className="p-4 space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sage-mist/30 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-forest-deep">Buat Faktur Penjualan Baru</h1>
                    <p className="text-sm text-emerald-moss/80">Isi informasi faktur penjualan Accurate.</p>
                </div>
            </div>

            {/* Invoice Information */}
            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm p-6">

                <h2 className="text-lg font-bold text-forest-deep mb-5">
                    Informasi Faktur
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Invoice Number */}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-forest-deep mb-2">
                            Nomor Faktur
                        </label>

                        <input
                            type="text"
                            value={invoiceNumber}
                            onChange={(e) =>
                                setInvoiceNumber(e.target.value)
                            }
                            placeholder="Contoh: INV-00001"
                            className="w-full px-4 py-2.5 rounded-xl border cursor-pointer border-sage-mist/50 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30 text-forest-deep"
                        />
                    </div>


                    {/* Customer */}

                    <div className="relative">

                        <label className="block text-xs font-bold uppercase tracking-wider text-forest-deep mb-2">
                            Customer
                        </label>

                        <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => {
                                setCustomerSearch(e.target.value);

                                // Kalau user mengetik lagi setelah memilih
                                setSelectedCustomer(null);
                                setCustomerNo("");
                            }}
                            placeholder="Cari nomor atau nama customer..."
                            className="w-full px-4 py-2.5 rounded-xl border cursor-pointer border-sage-mist/50 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30 text-forest-deep"
                        />

                        {showCustomerResults && customerResults.length > 0 && (

                            <div className="absolute z-50 mt-2 w-full bg-white border border-sage-mist/30 rounded-xl shadow-lg max-h-72 overflow-y-auto">

                                {customerResults.map((customer) => (

                                    <button
                                        key={customer.customer_no}
                                        type="button"
                                        onClick={() => {

                                            setSelectedCustomer(customer);

                                            setCustomerNo(
                                                customer.customer_no
                                            );

                                            setCustomerSearch(
                                                `${customer.customer_no} - ${customer.name}`
                                            );

                                            setShowCustomerResults(false);

                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-eco-white transition cursor-pointer"
                                    >

                                        <div className="font-semibold text-forest-deep">
                                            {customer.customer_no}
                                        </div>

                                        <div className="text-sm text-emerald-moss">
                                            {customer.name}
                                        </div>

                                    </button>

                                ))}

                            </div>

                        )}

                    </div>
                    {/* Transaction Date */}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-forest-deep mb-2">
                            Tanggal Transaksi
                        </label>

                        <input
                            type="date"
                            value={transDate}
                            onChange={(e) =>
                                setTransDate(e.target.value)
                            }
                            className="w-full px-4 py-2.5 rounded-xl border cursor-pointer border-sage-mist/50 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30 text-forest-deep"
                        />
                    </div>

                </div>

            </div>


            {/* Add Item */}

            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm p-6">

                <h2 className="text-lg font-bold text-forest-deep mb-5">
                    Detail Barang
                </h2>

                <div className="relative">

                    <label className="block text-xs font-bold uppercase tracking-wider text-forest-deep mb-2">
                        Item
                    </label>

                    <input
                        type="text"
                        value={itemSearch}
                        onChange={(e) => {
                            setItemSearch(e.target.value);
                            setSelectedItem(null);
                        }}
                        placeholder="Cari nomor atau nama item..."
                        className="w-full px-4 py-2.5 rounded-xl border cursor-pointer border-sage-mist/50 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30 text-forest-deep"
                    />

                    {showItemResults && itemResults.length > 0 && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-sage-mist/30 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                            {itemResults.map((item) => (

                                <button
                                    key={item.item_no}
                                    type="button"
                                    onClick={() => handleItemSelect(item)}
                                    className="w-full text-left px-4 py-3 hover:bg-eco-white transition cursor-pointer"
                                >
                                    <div className="font-semibold text-forest-deep">
                                        {item.item_no}
                                    </div>

                                    <div className="text-sm text-emerald-moss">
                                        {item.name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ===================================================
            Item Table
        ==================================================== */}

                <div className="mt-6">

                    {invoiceItems.length === 0 ? (

                        <div className="p-8 text-center text-gray-500 border border-dashed border-sage-mist/40 rounded-xl">
                            Belum ada barang yang ditambahkan.
                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full text-left border-collapse">

                                <thead>

                                    <tr className="bg-eco-white/60 text-forest-deep text-xs font-bold uppercase tracking-wider border-b border-sage-mist/20">

                                        <th className="py-3 px-4">
                                            Item
                                        </th>

                                        <th className="py-3 px-4">
                                            Deskripsi
                                        </th>

                                        <th className="py-3 px-4 text-right">
                                            Harga
                                        </th>

                                        <th className="py-3 px-4 text-right">
                                            Qty
                                        </th>

                                        <th className="py-3 px-4 text-right">
                                            Total
                                        </th>

                                        <th className="py-3 px-4">
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-sage-mist/20 text-sm text-forest-deep">

                                    {invoiceItems.map((item, index) => (

                                        <tr key={index}>

                                            <td className="py-4 px-4">

                                                <div className="font-semibold">
                                                    {item.itemNo}
                                                </div>

                                                <div className="text-xs text-emerald-moss">
                                                    {item.itemName}
                                                </div>

                                            </td>

                                            <td className="py-4 px-4 text-sm">
                                                {item.description || "-"}
                                            </td>

                                            <td className="py-4 px-4 text-right">
                                                {item.unitPrice.toLocaleString()}
                                            </td>

                                            <td className="py-4 px-4 text-right">
                                                {item.quantity}
                                            </td>

                                            <td className="py-4 px-4 text-right font-semibold">
                                                {(item.unitPrice * item.quantity).toLocaleString()}
                                            </td>

                                            <td className="py-4 px-4 text-right">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveItem(index)
                                                    }
                                                    className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                                >
                                                    Hapus
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* =====================================================
          Create Button
      ====================================================== */}

            <div className="flex justify-end">

                <button
                    type="button"
                    onClick={handleCreate}
                    className="px-6 py-3 rounded-xl bg-forest-deep text-white font-semibold hover:opacity-90 transition cursor-pointer"
                >
                    Create
                </button>

            </div>


            {/* MODAL */}

            {isModalOpen && selectedItem && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">

                        {/* Modal Header */}

                        <div className="p-6 border-b border-sage-mist/20">

                            <h2 className="text-xl font-bold text-forest-deep">
                                Detail Item
                            </h2>

                            <p className="text-sm text-emerald-moss mt-1">
                                {selectedItem.item_no} - {selectedItem.name}
                            </p>

                        </div>


                        {/* Modal Body */}

                        <div className="p-6 space-y-5">

                            {/* Unit Price */}

                            <div>

                                <label className="block text-xs font-bold uppercase tracking-wider text-forest-deep mb-2">
                                    Unit Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={unitPrice}
                                    onChange={(e) =>
                                        setUnitPrice(e.target.value)
                                    }
                                    placeholder="Masukkan harga"
                                    className="w-full px-4 py-2.5 rounded-xl border text-forest-deep border-sage-mist/50 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30"
                                />

                            </div>


                            {/* Quantity */}

                            <div>

                                <label className="block text-xs font-bold uppercase tracking-wider text-forest-deep mb-2">
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(e.target.value)
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border text-forest-deep border-sage-mist/50 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30"
                                />

                            </div>


                            {/* Description */}

                            <div>

                                <label className="block text-xs font-bold uppercase tracking-wider text-forest-deep mb-2">
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Deskripsi item..."
                                    className="w-full px-4 py-2.5 rounded-xl border text-forest-deep border-sage-mist/50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-moss/30"
                                />

                            </div>

                        </div>


                        {/* Modal Footer */}

                        <div className="p-6 border-t border-sage-mist/20 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedItem(null);
                                }}
                                className="px-4 py-2.5 rounded-xl border border-sage-mist/50 text-forest-deep font-semibold hover:bg-eco-white transition"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-5 py-2.5 rounded-xl bg-forest-deep text-white font-semibold hover:opacity-90 transition"
                            >
                                Next
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}