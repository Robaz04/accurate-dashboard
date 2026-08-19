"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// =========================================================
// Interface
// =========================================================

interface Customer {
    customerNo?: string;
    name?: string;
}

interface Bank {
    no?: string;
    name?: string;
}

interface DetailDiscount {
    accountNo: string;
    amount: number;
}

interface ReceiptInvoice {
    id?: number;

    invoiceNo: string;
    invoiceDate: string;

    owing: number;
    paymentAmount: number;

    detailDiscount: DetailDiscount[];
}

interface ReceiptDetail {
    id: number;
    number: string;

    customer?: Customer;
    customerNo?: string;

    bank?: Bank;
    bankNo?: string;

    transDate: string;

    chequeAmount?: number;

    detailInvoice: ReceiptInvoice[];
}

// =========================================================
// Page
// =========================================================

export default function SalesReceiptEditPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id as string;

    // =========================================================
    // Receipt
    // =========================================================

    const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);

    const [number, setNumber] = useState("");
    const [customerNo, setCustomerNo] = useState("");
    const [customerName, setCustomerName] = useState("");

    const [bankNo, setBankNo] = useState("");
    const [bankName, setBankName] = useState("");

    const [transDate, setTransDate] = useState("");

    // =========================================================
    // Invoice Details
    // =========================================================

    const [receiptInvoices, setReceiptInvoices] = useState<ReceiptInvoice[]>([]);

    const [deletedInvoices, setDeletedInvoices] = useState<ReceiptInvoice[]>([]);

    // =========================================================
    // Loading
    // =========================================================

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // =========================================================
    // Fetch Receipt Detail
    // =========================================================

    useEffect(() => {
        if (!id) return;

        const fetchReceiptDetail = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `/api/sales-receipt/${encodeURIComponent(id)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    },
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();

                console.log("Sales Receipt Detail:", result);

                if (!result.success) {
                    throw new Error(
                        result.message || "Gagal mengambil detail sales receipt",
                    );
                }

                const data = result.data;

                setReceipt(data);

                // =================================================
                // Basic Receipt Data
                // =================================================

                setNumber(data.number || "");

                setCustomerNo(data.customer?.customerNo || data.customerNo || "");

                setCustomerName(data.customer?.name || "");

                setBankNo(data.bank?.no || data.bankNo || "");

                setBankName(data.bank?.name || "");

                setTransDate(
                    formatDateForInput(
                        data.transDate || ""
                    )
                );

                // =================================================
                // Detail Invoice
                // =================================================

                const mappedInvoices: ReceiptInvoice[] = (data.detailInvoice || []).map(
                    (invoice: any) => ({
                        id: invoice.id,

                        invoiceNo: invoice.invoiceNo || invoice.invoice?.number || "",

                        invoiceDate:
                            invoice.invoiceDate || invoice.invoice?.transDate || "",

                        owing: Number(invoice.owing || invoice.invoice?.primeOwing || 0),

                        paymentAmount: Number(invoice.paymentAmount || 0),

                        detailDiscount: (invoice.detailDiscount || []).map(
                            (discount: any) => ({
                                accountNo: discount.accountNo,

                                amount: Number(discount.amount || 0),
                            }),
                        ),
                    }),
                );

                setReceiptInvoices(mappedInvoices);
            } catch (error) {
                console.error("Sales receipt detail error:", error);

                alert("Gagal mengambil detail sales receipt.");

                router.push("/sales-receipt");
            } finally {
                setLoading(false);
            }
        };

        fetchReceiptDetail();
    }, [id, router]);

    // =========================================================
    // Change Payment Amount
    // =========================================================

    const handlePaymentChange = (index: number, value: string) => {
        const amount = Number(value);

        setReceiptInvoices((prev) =>
            prev.map((invoice, i) =>
                i === index
                    ? {
                        ...invoice,
                        paymentAmount: Number.isNaN(amount) ? 0 : amount,
                    }
                    : invoice,
            ),
        );
    };

    const formatDateForInput = (date: string) => {
        if (!date) return "";

        // Accurate: DD/MM/YYYY
        const [day, month, year] = date.split("/");

        return `${year}-${month}-${day}`;
    };

    const formatDateForAccurate = (date: string) => {
        if (!date) return "";

        // Input: YYYY-MM-DD
        const [year, month, day] = date.split("-");

        return `${day}/${month}/${year}`;
    };

    // =========================================================
    // Remove Invoice
    // =========================================================

    const handleRemoveInvoice = (index: number) => {
        const invoice = receiptInvoices[index];

        if (!invoice) {
            return;
        }

        const confirmed = window.confirm(
            `Hapus invoice ${invoice.invoiceNo} dari sales receipt?`,
        );

        if (!confirmed) {
            return;
        }

        // Invoice existing dari Accurate
        if (invoice.id) {
            setDeletedInvoices((prev) => [...prev, invoice]);
        }

        // Hapus dari tampilan
        setReceiptInvoices((prev) => prev.filter((_, i) => i !== index));
    };

    // =========================================================
    // Calculate Cheque Amount
    // =========================================================

    const chequeAmount = receiptInvoices.reduce(
        (total, invoice) => total + Number(invoice.paymentAmount || 0),
        0,
    );

    // =========================================================
    // Update
    // =========================================================

    const handleUpdate = async () => {
        if (!number.trim()) {
            alert("Nomor bukti wajib diisi.");

            return;
        }

        if (!customerNo) {
            alert("Customer wajib diisi.");

            return;
        }

        if (!bankNo) {
            alert("Bank wajib diisi.");

            return;
        }

        if (!transDate) {
            alert("Tanggal wajib diisi.");

            return;
        }

        if (receiptInvoices.length === 0 && deletedInvoices.length === 0) {
            alert("Minimal harus ada satu invoice.");

            return;
        }

        // =====================================================
        // Validate Payment
        // =====================================================

        for (const invoice of receiptInvoices) {
            if (invoice.paymentAmount <= 0) {
                alert(
                    `Payment amount invoice ${invoice.invoiceNo} harus lebih dari 0.`,
                );

                return;
            }
        }

        // =====================================================
        // Payload
        // =====================================================

        const receiptData = {
            id: Number(id),
            number,
            bankNo,
            branchId: 50, 
            chequeAmount,
            customerNo,
            transDate: formatDateForAccurate(transDate),
            detailInvoice: [
                // =============================================
                // Existing / Active Invoice
                // =============================================

                ...receiptInvoices.map((invoice) => ({
                    ...(invoice.id
                        ? {
                            id: invoice.id,
                        }
                        : {}),

                    invoiceNo: invoice.invoiceNo,

                    paymentAmount: invoice.paymentAmount,

                    detailDiscount: invoice.detailDiscount,
                })),

                // =============================================
                // Deleted Invoice
                // =============================================

                ...deletedInvoices.map((invoice) => ({
                    ...(invoice.id
                        ? {
                            id: invoice.id,
                        }
                        : {}),

                    invoiceNo: invoice.invoiceNo,

                    _status: "delete",
                })),
            ],
        };

        // =====================================================
        // Debug
        // =====================================================

        console.log(
            "Sales Receipt UPDATE JSON:",
            JSON.stringify(receiptData, null, 2),
        );

        alert("Payload berhasil dibuat. Cek console untuk melihat JSON payload.");


        // =====================================================
        // POST Update
        // =====================================================

        try {
            setUpdating(true);

            const response = await fetch(
                "/api/sales-receipt",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        receiptData
                    ),
                }
            );

            const result =
                await response.json();

            console.log(
                "Update Sales Receipt:",
                result
            );

            if (
                !response.ok ||
                !result.success
            ) {
                alert(
                    result.message ||
                    "Gagal mengupdate sales receipt."
                );

                return;
            }

            alert(
                "Sales receipt berhasil diupdate."
            );

            router.push(
                `/sales-receipt/${id}`
            );

        } catch (error) {
            console.error(
                "Update sales receipt error:",
                error
            );

            alert(
                "Terjadi kesalahan saat mengupdate sales receipt."
            );

        } finally {
            setUpdating(false);
        }

    };

    // =========================================================
    // Loading UI
    // =========================================================

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-emerald-moss">Memuat detail sales receipt...</p>
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="p-6">
                <p className="text-red-500">Data sales receipt tidak ditemukan.</p>
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

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-forest-deep">
                    Edit Sales Receipt
                </h1>

                <p className="text-sm text-emerald-moss/80">
                    Ubah informasi pembayaran sales receipt.
                </p>
            </div>

            {/* ================================================= */}
            {/* Receipt Information */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-forest-deep mb-5">
                    Informasi Sales Receipt
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Number */}

                    <div>
                        <label className="block text-sm font-medium text-forest-deep mb-2">
                            No Bukti
                        </label>

                        <input
                            type="text"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="w-full rounded-xl border text-forest-deep border-sage-mist/40 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-moss/30"
                        />
                    </div>

                    {/* Customer */}

                    <div>
                        <label className="block text-sm font-medium text-forest-deep mb-2">
                            Customer
                        </label>

                        <input
                            type="text"
                            value={
                                customerName ? `${customerNo} - ${customerName}` : customerNo
                            }
                            disabled
                            className="w-full rounded-xl border border-sage-mist/40 bg-gray-50 px-4 py-3 text-gray-600"
                        />
                    </div>

                    {/* Bank */}

                    <div>
                        <label className="block text-sm font-medium text-forest-deep mb-2">
                            Bank
                        </label>

                        <input
                            type="text"
                            value={bankName ? `${bankNo} - ${bankName}` : bankNo}
                            disabled
                            className="w-full rounded-xl border border-sage-mist/40 bg-gray-50 px-4 py-3 text-gray-600"
                        />
                    </div>

                    {/* Date */}

                    <div>
                        <label className="block text-sm font-medium text-forest-deep mb-2">
                            Tanggal Pembayaran
                        </label>

                        <input
                            type="date"
                            value={transDate}
                            onChange={(e) => setTransDate(e.target.value)}
                            className="w-full rounded-xl border text-forest-deep border-sage-mist/40 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-moss/30"
                        />
                    </div>
                </div>
            </div>

            {/* ================================================= */}
            {/* Invoice Payment */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-semibold text-forest-deep">
                            Detail Pembayaran
                        </h2>

                        <p className="text-sm text-emerald-moss/70">
                            Ubah nominal pembayaran atau hapus invoice dari receipt.
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total Pembayaran</p>

                        <p className="text-xl font-bold text-forest-deep">
                            Rp {chequeAmount.toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>

                {/* ================================================= */}
                {/* Table */}
                {/* ================================================= */}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sage-mist/30 text-left">
                                <th className="px-4 py-3 font-semibold text-forest-deep">
                                    No Invoice
                                </th>

                                <th className="px-4 py-3 font-semibold text-forest-deep">
                                    Tanggal
                                </th>

                                <th className="px-4 py-3 font-semibold text-forest-deep">
                                    Terutang
                                </th>

                                <th className="px-4 py-3 font-semibold text-forest-deep">
                                    Dibayar
                                </th>

                                <th className="px-4 py-3 text-center font-semibold text-forest-deep">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {receiptInvoices.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        Tidak ada invoice dalam receipt ini.
                                    </td>
                                </tr>
                            ) : (
                                receiptInvoices.map((invoice, index) => (
                                    <tr
                                        key={invoice.id || `${invoice.invoiceNo}-${index}`}
                                        className="border-b border-sage-mist/20"
                                    >
                                        {/* Invoice Number */}

                                        <td className="px-4 py-4">
                                            <span className="font-semibold text-forest-deep">
                                                {invoice.invoiceNo}
                                            </span>
                                        </td>

                                        {/* Date */}

                                        <td className="px-4 py-4 text-gray-600">
                                            {invoice.invoiceDate || "-"}
                                        </td>

                                        {/* Owing */}

                                        <td className="px-4 py-4 text-forest-deep">
                                            Rp {Number(invoice.owing).toLocaleString("id-ID")}
                                        </td>

                                        {/* Payment */}

                                        <td className="px-4 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                value={invoice.paymentAmount}
                                                onChange={(e) =>
                                                    handlePaymentChange(index, e.target.value)
                                                }
                                                className="w-40 rounded-lg border text-forest-deep border-sage-mist/40 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-moss/30"
                                            />
                                        </td>

                                        {/* Delete */}

                                        <td className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveInvoice(index)}
                                                className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================================================= */}
            {/* Bottom Actions */}
            {/* ================================================= */}

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={() => router.push(`/sales-receipt/${id}`)}
                    className="px-5 py-3 rounded-xl border border-sage-mist/40 text-gray-600 hover:bg-gray-50 transition"
                >
                    Batal
                </button>

                <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={updating}
                    className="px-6 py-3 rounded-xl bg-forest-deep text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                >
                    {updating ? "Mengupdate..." : "Update Sales Receipt"}
                </button>
            </div>
        </div>
    );
}
