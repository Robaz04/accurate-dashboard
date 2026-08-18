"use client";

import { useEffect, useState } from "react";

// =========================================================
// Interfaces
// =========================================================

interface CustomerOption {
    customer_no: string;
    name: string;
}

interface InvoiceOption {
    id: number;
    number: string;
    customerNo: string;
    transDate: string;
    totalAmount: number;
}

interface InvoiceDetail {
    id: number;
    number: string;
    transDate: string;
    totalAmount: number;
    primeOwing: number;
}

interface ReceiptInvoice {
    invoiceNo: string;
    invoiceId: number;
    invoiceDate: string;
    totalAmount: number;
    primeOwing: number;
    paymentAmount: number;
}

// =========================================================
// Page
// =========================================================

export default function SalesReceiptPage() {

    // =====================================================
    // Receipt
    // =====================================================

    const [receiptNumber, setReceiptNumber] = useState("");
    const [customerNo, setCustomerNo] = useState("");
    const [transDate, setTransDate] = useState("");

    const bankNo = "101.01.01";

    // =====================================================
    // Customer Search
    // =====================================================

    const [customerSelected, setCustomerSelected] = useState(false);
    const [customerSearch, setCustomerSearch] = useState("");
    const [customerResults, setCustomerResults] =
        useState<CustomerOption[]>([]);

    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerOption | null>(null);

    const [showCustomerResults, setShowCustomerResults] =
        useState(false);

    const [customerLoading, setCustomerLoading] =
        useState(false);

    // =====================================================
    // Invoice Search
    // =====================================================

    const [invoiceSearch, setInvoiceSearch] = useState("");

    const [invoiceResults, setInvoiceResults] =
        useState<InvoiceOption[]>([]);

    const [showInvoiceResults, setShowInvoiceResults] =
        useState(false);

    const [invoiceLoading, setInvoiceLoading] =
        useState(false);

    // =====================================================
    // Selected Invoice / Modal
    // =====================================================

    const [selectedInvoice, setSelectedInvoice] =
        useState<InvoiceDetail | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [paymentAmount, setPaymentAmount] = useState("");

    // =====================================================
    // Receipt Invoice Table
    // =====================================================

    const [receiptInvoices, setReceiptInvoices] =
        useState<ReceiptInvoice[]>([]);

    // =====================================================
    // Customer Search - Debounce
    // =====================================================

    useEffect(() => {
        const keyword = customerSearch.trim();

        if (!keyword || customerSelected) {
            setCustomerResults([]);
            setShowCustomerResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setCustomerLoading(true);

                const response = await fetch(
                    `http://localhost:3001/api/customers/search?q=${encodeURIComponent(keyword)}`
                );

                const result = await response.json();

                setCustomerResults(
                    (result.data || []).slice(0, 15)
                );

                setShowCustomerResults(true);

            } catch (error) {
                console.error("Customer search error:", error);
                setCustomerResults([]);
            } finally {
                setCustomerLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);

    }, [customerSearch, customerSelected]);

    // =====================================================
    // Invoice Search - Debounce
    // =====================================================

    useEffect(() => {

        const keyword = invoiceSearch.trim();

        if (!selectedCustomer || !keyword) {
            setInvoiceResults([]);
            setShowInvoiceResults(false);
            return;
        }

        const timer = setTimeout(async () => {

            try {

                setInvoiceLoading(true);

                const response = await fetch(
                    `http://localhost:3001/api/invoices/search?customerNo=${encodeURIComponent(
                        selectedCustomer.customer_no
                    )}&q=${encodeURIComponent(keyword)}`
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Gagal mencari invoice"
                    );
                }

                setInvoiceResults(
                    (result.data || []).slice(0, 15)
                );

                setShowInvoiceResults(true);

            } catch (error) {

                console.error("Invoice search error:", error);

                setInvoiceResults([]);

            } finally {

                setInvoiceLoading(false);

            }

        }, 300);

        return () => clearTimeout(timer);

    }, [invoiceSearch, selectedCustomer]);

    // =====================================================
    // Select Customer
    // =====================================================

    const handleSelectCustomer = (customer: CustomerOption) => {
        setSelectedCustomer(customer);
        setCustomerNo(customer.customer_no);

        setCustomerSearch(
            `${customer.customer_no} - ${customer.name}`
        );

        setCustomerSelected(true);

        setShowCustomerResults(false);

        setInvoiceSearch("");
        setInvoiceResults([]);
        setShowInvoiceResults(false);
    };

    // =====================================================
    // Select Invoice
    // =====================================================

    const handleSelectInvoice = async (
        invoice: InvoiceOption
    ) => {

        try {

            setInvoiceLoading(true);

            const response = await fetch(
                `http://localhost:3001/api/invoices/${invoice.id}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Gagal mengambil detail invoice"
                );
            }

            const detail: InvoiceDetail = result.data;

            setSelectedInvoice(detail);

            setPaymentAmount("");

            setIsModalOpen(true);

            setInvoiceSearch("");

            setShowInvoiceResults(false);

        } catch (error) {

            console.error("Invoice detail error:", error);

            alert("Gagal mengambil detail invoice.");

        } finally {

            setInvoiceLoading(false);

        }
    };

    // =====================================================
    // Add Invoice
    // =====================================================

    const handleAddInvoice = () => {

        if (!selectedInvoice) {
            return;
        }

        const amount = Number(paymentAmount);

        if (!paymentAmount || amount <= 0) {

            alert(
                "Nominal pembayaran harus lebih dari 0."
            );

            return;
        }

        if (amount > selectedInvoice.primeOwing) {

            alert(
                "Nominal pembayaran tidak boleh lebih besar dari jumlah terutang."
            );

            return;
        }

        // Cek invoice sudah ditambahkan atau belum
        const alreadyExists = receiptInvoices.some(
            (item) =>
                item.invoiceId === selectedInvoice.id
        );

        if (alreadyExists) {

            alert(
                "Invoice tersebut sudah ditambahkan."
            );

            return;
        }

        const newReceiptInvoice: ReceiptInvoice = {

            invoiceNo: selectedInvoice.number,

            invoiceId: selectedInvoice.id,

            invoiceDate: selectedInvoice.transDate,

            totalAmount: selectedInvoice.totalAmount,

            primeOwing: selectedInvoice.primeOwing,

            paymentAmount: amount,

        };

        setReceiptInvoices((prev) => [
            ...prev,
            newReceiptInvoice,
        ]);

        // Reset modal
        setIsModalOpen(false);

        setSelectedInvoice(null);

        setPaymentAmount("");

    };

    // =====================================================
    // Remove Invoice
    // =====================================================

    const handleRemoveInvoice = (
        index: number
    ) => {

        setReceiptInvoices((prev) =>
            prev.filter((_, i) => i !== index)
        );

    };

    // =====================================================
    // Total Payment
    // =====================================================

    const totalPayment = receiptInvoices.reduce(
        (total, invoice) =>
            total + invoice.paymentAmount,
        0
    );

    // =====================================================
    // Debug JSON
    // =====================================================
    const formatDate = (date: string) => {
        if (!date) return "";

        const [year, month, day] = date.split("-");

        return `${day}/${month}/${year}`;
    };

    const receiptData = {
        bankNo,
        chequeAmount: totalPayment,
        customerNo,
        branchId: 50,
        transDate: formatDate(transDate),
        detailInvoice:
            receiptInvoices.map((invoice) => ({
                invoiceNo: invoice.invoiceNo,
                paymentAmount:
                    invoice.paymentAmount,
                detailDiscount: [],
            })),

    };

    // =====================================================
    // Bayar
    // =====================================================

    const handlePay = async () => {

        if (!receiptNumber.trim()) {
            alert("No bukti harus diisi.");
            return;
        }

        if (!customerNo) {
            alert("Customer harus dipilih.");
            return;
        }

        if (!transDate) {
            alert("Tanggal pembayaran harus diisi.");
            return;
        }

        if (receiptInvoices.length === 0) {
            alert("Minimal satu invoice harus dipilih.");
            return;
        }

        try {
            console.log(
                "Sales Receipt JSON:",
                JSON.stringify(
                    receiptData,
                    null,
                    2
                )
            );

            const response = await fetch(
                "http://localhost:3001/api/sales-receipts",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify(receiptData),
                }
            );
            const result =
                await response.json();
            console.log(
                "Sales Receipt Response:",
                result
            );
            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Gagal membuat Sales Receipt"
                );
            }
            alert(
                "Sales Receipt berhasil dibuat!"
            );
            console.log(
                "Accurate response:",
                result.data
            );
        } catch (error) {
            console.error(
                "Create Sales Receipt error:",
                error
            );
            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal membuat Sales Receipt"
            );
        }
    };

    // =====================================================
    // Format Currency
    // =====================================================

    const formatCurrency = (
        value: number
    ) => {

        return `Rp ${value.toLocaleString(
            "id-ID"
        )}`;

    };

    // =====================================================
    // Render
    // =====================================================

    return (

        <div className="p-4 space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sage-mist/30 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-forest-deep">Buat Sales Receipt</h1>
                    <p className="text-sm text-emerald-moss/80">Isi informasi penerimaan pembayaran dari customer.</p>
                </div>
            </div>


            {/* =================================================
                Receipt Information
            ================================================= */}

            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm p-6 mb-6">

                <h2 className="text-lg font-bold text-forest-deep mb-5">
                    Informasi Pembayaran
                </h2>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* No Bukti */}

                    <div>

                        <label className="block text-sm font-semibold text-forest-deep mb-2">
                            No Bukti
                        </label>

                        <input
                            type="text"
                            value={receiptNumber}
                            onChange={(e) =>
                                setReceiptNumber(
                                    e.target.value
                                )
                            }
                            placeholder="Contoh: SR.2026.001"
                            className="w-full px-4 py-3 rounded-xl border text-forest-deep border-sage-mist/40 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30"
                        />

                    </div>


                    {/* Bank */}

                    <div>

                        <label className="block text-sm font-semibold text-forest-deep mb-2">
                            Bank
                        </label>

                        <input
                            type="text"
                            value={bankNo}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-sage-mist/40 bg-gray-50 text-gray-600"
                        />

                    </div>


                    {/* Customer */}

                    <div className="relative">

                        <label className="block text-sm font-semibold text-forest-deep mb-2">
                            Customer
                        </label>

                        <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                setCustomerSelected(false);
                                setSelectedCustomer(null);
                                setCustomerNo("");
                            }}
                            placeholder="Cari customer..."
                            className="w-full px-4 py-3 rounded-xl border text-forest-deep border-sage-mist/40 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30"
                        />
                        {/* Customer Results */}

                        {showCustomerResults && (
                            <div className="absolute z-50 mt-2 w-full bg-white border border-sage-mist/30 rounded-xl shadow-lg overflow-hidden">

                                <div className="max-h-72 overflow-y-auto">

                                    {customerLoading ? (

                                        <div className="p-4 text-sm text-gray-500">
                                            Mencari customer...
                                        </div>

                                    ) : (customerResults.length === 0) ? (

                                        <div className="p-4 text-sm text-gray-500">
                                            Customer tidak ditemukan.
                                        </div>

                                    ) : (

                                        customerResults
                                            .slice(0, 15)
                                            .map((customer) => (

                                                <button
                                                    key={
                                                        customer.customer_no
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectCustomer(
                                                            customer
                                                        )
                                                    }
                                                    className="w-full text-left px-4 py-3 hover:bg-eco-white transition border-b border-sage-mist/10 last:border-b-0"
                                                >

                                                    <div className="font-semibold text-forest-deep">
                                                        {
                                                            customer.customer_no
                                                        }
                                                    </div>

                                                    <div className="text-sm text-emerald-moss">
                                                        {
                                                            customer.name
                                                        }
                                                    </div>

                                                </button>

                                            ))

                                    )}

                                </div>

                            </div>
                        )}

                    </div>


                    {/* Transaction Date */}

                    <div>

                        <label className="block text-sm font-semibold text-forest-deep mb-2">
                            Tanggal Pembayaran
                        </label>

                        <input
                            type="date"
                            value={transDate}
                            onChange={(e) =>
                                setTransDate(
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-3 rounded-xl border text-forest-deep border-sage-mist/40 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30"
                        />

                    </div>

                </div>

            </div>


            {/* =================================================
                Invoice Search
            ================================================= */}

            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm p-6 mb-6">

                <h2 className="text-lg font-bold text-forest-deep mb-2">
                    Invoice Pembayaran
                </h2>

                <p className="text-sm text-emerald-moss/70 mb-5">

                    {selectedCustomer
                        ? `Invoice milik ${selectedCustomer.customer_no}`
                        : "Pilih customer terlebih dahulu."}

                </p>


                <div className="relative">

                    <input
                        type="text"
                        value={invoiceSearch}
                        disabled={!selectedCustomer}
                        onChange={(e) =>
                            setInvoiceSearch(
                                e.target.value
                            )
                        }
                        placeholder={
                            selectedCustomer
                                ? "Cari nomor invoice..."
                                : "Pilih customer terlebih dahulu"
                        }
                        className="w-full px-4 py-3 rounded-xl border text-forest-deep border-sage-mist/40 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-moss/30"
                    />


                    {/* Invoice Results */}

                    {showInvoiceResults && (
                        <div className="absolute z-40 mt-2 w-full bg-white border border-sage-mist/30 rounded-xl shadow-lg overflow-hidden">

                            <div className="max-h-72 overflow-y-auto">

                                {invoiceLoading ? (

                                    <div className="p-4 text-sm text-gray-500">
                                        Mencari invoice...
                                    </div>

                                ) : invoiceResults.length === 0 ? (

                                    <div className="p-4 text-sm text-gray-500">
                                        Invoice tidak ditemukan.
                                    </div>

                                ) : (

                                    invoiceResults
                                        .slice(0, 15)
                                        .map((invoice) => (

                                            <button
                                                key={invoice.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectInvoice(
                                                        invoice
                                                    )
                                                }
                                                className="w-full text-left px-4 py-3 hover:bg-eco-white transition border-b border-sage-mist/10 last:border-b-0"
                                            >

                                                <div className="flex justify-between items-center">

                                                    <div>

                                                        <div className="font-semibold text-forest-deep">
                                                            {
                                                                invoice.number
                                                            }
                                                        </div>

                                                        <div className="text-sm text-emerald-moss">
                                                            {
                                                                invoice.transDate
                                                            }
                                                        </div>

                                                    </div>

                                                    <div className="text-sm font-semibold text-forest-deep">
                                                        {
                                                            formatCurrency(
                                                                invoice.totalAmount
                                                            )
                                                        }
                                                    </div>

                                                </div>

                                            </button>

                                        ))

                                )}

                            </div>

                        </div>
                    )}

                </div>

            </div>


            {/* =================================================
                Receipt Invoice Table
            ================================================= */}

            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm overflow-hidden mb-6">

                <div className="p-5 border-b border-sage-mist/20">

                    <h2 className="text-lg font-bold text-forest-deep">
                        Invoice yang Dibayar
                    </h2>

                </div>


                {receiptInvoices.length === 0 ? (

                    <div className="p-8 text-center text-gray-500">
                        Belum ada invoice yang dipilih.
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-left border-collapse">

                            <thead>

                                <tr className="bg-eco-white/60 text-forest-deep text-xs font-bold uppercase tracking-wider border-b border-sage-mist/20">

                                    <th className="py-3 px-6">
                                        Invoice
                                    </th>

                                    <th className="py-3 px-6">
                                        Tanggal
                                    </th>

                                    <th className="py-3 px-6">
                                        Total Invoice
                                    </th>

                                    <th className="py-3 px-6">
                                        Terutang
                                    </th>

                                    <th className="py-3 px-6">
                                        Dibayar
                                    </th>

                                    <th className="py-3 px-6">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-sage-mist/20 text-sm text-forest-deep">

                                {receiptInvoices.map(
                                    (invoice, index) => (

                                        <tr
                                            key={
                                                invoice.invoiceId
                                            }
                                            className="hover:bg-eco-white/30 transition"
                                        >

                                            <td className="py-4 px-6 font-semibold">
                                                {
                                                    invoice.invoiceNo
                                                }
                                            </td>

                                            <td className="py-4 px-6">
                                                {
                                                    invoice.invoiceDate
                                                }
                                            </td>

                                            <td className="py-4 px-6">
                                                {
                                                    formatCurrency(
                                                        invoice.totalAmount
                                                    )
                                                }
                                            </td>

                                            <td className="py-4 px-6">
                                                {
                                                    formatCurrency(
                                                        invoice.primeOwing
                                                    )
                                                }
                                            </td>

                                            <td className="py-4 px-6 font-semibold text-emerald-moss">
                                                {
                                                    formatCurrency(
                                                        invoice.paymentAmount
                                                    )
                                                }
                                            </td>

                                            <td className="py-4 px-6">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveInvoice(
                                                            index
                                                        )
                                                    }
                                                    className="px-3 py-1.5 text-xs font-semibold text-red-600 rounded-lg border border-red-200 hover:bg-red-50 transition cursor-pointer"
                                                >
                                                    Hapus
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}


                {/* Total */}

                {receiptInvoices.length > 0 && (

                    <div className="p-5 border-t border-sage-mist/20 flex justify-end">

                        <div className="text-right">

                            <p className="text-sm text-emerald-moss">
                                Total Pembayaran
                            </p>

                            <p className="text-2xl font-bold text-forest-deep">
                                {
                                    formatCurrency(
                                        totalPayment
                                    )
                                }
                            </p>

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
                Bayar Button
            ================================================= */}

            <div className="flex justify-end">

                <button
                    type="button"
                    onClick={handlePay}
                    className="px-6 py-3 rounded-xl bg-forest-deep text-white font-semibold hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                    disabled={
                        receiptInvoices.length === 0
                    }
                >
                    Bayar
                </button>

            </div>


            {/* =================================================
                Payment Modal
            ================================================= */}

            {isModalOpen &&
                selectedInvoice && (

                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">

                        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">

                            {/* Header */}

                            <div className="p-6 border-b border-sage-mist/20">

                                <h2 className="text-xl font-bold text-forest-deep">
                                    Pembayaran Invoice
                                </h2>

                                <p className="text-sm text-emerald-moss mt-1">
                                    Masukkan nominal pembayaran.
                                </p>

                            </div>


                            {/* Body */}

                            <div className="p-6 space-y-4">

                                <div>

                                    <p className="text-xs text-gray-500">
                                        No Invoice
                                    </p>

                                    <p className="font-semibold text-forest-deep">
                                        {
                                            selectedInvoice.number
                                        }
                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-gray-500">
                                        Tanggal Invoice
                                    </p>

                                    <p className="font-semibold text-forest-deep">
                                        {
                                            selectedInvoice.transDate
                                        }
                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-gray-500">
                                        Total Invoice
                                    </p>

                                    <p className="font-semibold text-forest-deep">
                                        {
                                            formatCurrency(
                                                selectedInvoice.totalAmount
                                            )
                                        }
                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-gray-500">
                                        Terutang
                                    </p>

                                    <p className="text-lg font-bold text-forest-deep">
                                        {
                                            formatCurrency(
                                                selectedInvoice.primeOwing
                                            )
                                        }
                                    </p>

                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-forest-deep mb-2">
                                        Nominal Pembayaran
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={
                                            selectedInvoice.primeOwing
                                        }
                                        value={
                                            paymentAmount
                                        }
                                        onChange={(e) =>
                                            setPaymentAmount(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Masukkan nominal"
                                        className="w-full px-4 py-3 rounded-xl border text-forest-deep border-sage-mist/40 focus:outline-none focus:ring-2 focus:ring-emerald-moss/30"
                                    />
                                </div>
                            </div>
                            {/* Footer */}
                            <div className="p-6 border-t border-sage-mist/20 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {

                                        setIsModalOpen(
                                            false
                                        );

                                        setSelectedInvoice(
                                            null
                                        );

                                        setPaymentAmount(
                                            ""
                                        );

                                    }}
                                    className="px-4 py-2.5 rounded-xl border border-sage-mist/40 text-forest-deep font-semibold hover:bg-eco-white transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={
                                        handleAddInvoice
                                    }
                                    className="px-5 py-2.5 rounded-xl bg-forest-deep text-white font-semibold hover:opacity-90 transition cursor-pointer"
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