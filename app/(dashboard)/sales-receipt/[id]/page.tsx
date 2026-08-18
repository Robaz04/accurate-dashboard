"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Customer {
    id?: number;
    customerNo?: string;
    name?: string;
}

interface Bank {
    id?: number;
    no?: string;
    name?: string;
}

interface InvoiceDetail {
    invoiceNo?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    paymentAmount?: number;
    owing?: number;
}

interface SalesReceiptDetail {
    id: number;
    number?: string;
    transDate?: string;
    customer?: Customer;
    bank?: Bank;
    chequeAmount?: number;
    totalPayment?: number;
    detailInvoice?: InvoiceDetail[];
}

export default function SalesReceiptDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [receipt, setReceipt] =
        useState<SalesReceiptDetail | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const id = params.id as string;

    useEffect(() => {
        const fetchReceiptDetail = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/sales-receipt/${id}`
                );

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}`
                    );
                }

                const result =
                    await response.json();

                console.log(
                    "Sales Receipt Detail:",
                    result
                );

                if (result.s && result.d) {
                    setReceipt(result.d);
                } else if (
                    result.success &&
                    result.data
                ) {
                    setReceipt(result.data);
                } else {
                    setError(
                        "Data receipt tidak ditemukan."
                    );
                }

            } catch (err) {
                console.error(
                    "Failed to fetch receipt detail:",
                    err
                );

                setError(
                    "Gagal mengambil detail receipt."
                );

            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchReceiptDetail();
        }
    }, [id]);

    // =========================================================
    // Loading
    // =========================================================

    if (loading) {
        return (
            <div className="p-8 text-center text-emerald-moss font-medium">
                Memuat detail penerimaan...
            </div>
        );
    }

    // =========================================================
    // Error
    // =========================================================

    if (error || !receipt) {
        return (
            <div className="p-8">
                <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                    <p className="text-red-600 font-medium">
                        {error ||
                            "Data receipt tidak ditemukan."}
                    </p>

                    <button
                        onClick={() =>
                            router.back()
                        }
                        className="mt-4 px-4 py-2 rounded-lg bg-forest-deep text-white text-sm font-semibold hover:opacity-90 transition"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    const totalPayment =
        receipt.totalPayment ??
        receipt.chequeAmount ??
        0;

    // =========================================================
    // Render
    // =========================================================

    return (
        <div className="p-6 space-y-6">
            <button>
                <span
                    onClick={() => router.back()}
                    className="text-sm text-emerald-moss cursor-pointer"
                >
                    ← Kembali
                </span>
            </button>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sage-mist/30 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-forest-deep">Detail Penerimaan</h1>
                    <p className="text-sm text-emerald-moss/80">Detail informasi penerimaan</p>
                </div>
            </div>


            {/* Receipt Information */}
            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm">

                <div className="px-6 py-4 border-b border-sage-mist/20">
                    <h2 className="font-bold text-forest-deep">
                        Informasi Penerimaan
                    </h2>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <p className="text-xs text-emerald-moss uppercase font-bold tracking-wider">
                            ID
                        </p>

                        <p className="mt-1 font-mono text-sm text-forest-deep">
                            {receipt.id}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs text-emerald-moss uppercase font-bold tracking-wider">
                            No. Bukti
                        </p>

                        <p className="mt-1 font-semibold text-forest-deep">
                            {receipt.number || "-"}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs text-emerald-moss uppercase font-bold tracking-wider">
                            Tanggal
                        </p>

                        <p className="mt-1 text-forest-deep">
                            {receipt.transDate || "-"}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs text-emerald-moss uppercase font-bold tracking-wider">
                            Customer
                        </p>

                        <p className="mt-1 font-semibold text-forest-deep">
                            {receipt.customer?.customerNo ||
                                "-"}
                        </p>

                        {receipt.customer?.name && (
                            <p className="text-sm text-emerald-moss">
                                {receipt.customer.name}
                            </p>
                        )}
                    </div>


                    <div>
                        <p className="text-xs text-emerald-moss uppercase font-bold tracking-wider">
                            Bank
                        </p>

                        <p className="mt-1 text-forest-deep">
                            {receipt.bank?.name ||
                                receipt.bank?.no ||
                                "-"}
                        </p>
                    </div>


                    <div>
                        <p className="text-xs text-emerald-moss uppercase font-bold tracking-wider">
                            Total Pembayaran
                        </p>

                        <p className="mt-1 text-lg font-bold text-forest-deep">
                            Rp{" "}
                            {Number(
                                totalPayment
                            ).toLocaleString(
                                "id-ID"
                            )}
                        </p>
                    </div>

                </div>
            </div>


            {/* Invoice Detail */}
            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm overflow-hidden">

                <div className="px-6 py-4 border-b border-sage-mist/20">
                    <h2 className="font-bold text-forest-deep">
                        Invoice yang Dibayar
                    </h2>
                </div>

                {receipt.detailInvoice &&
                    receipt.detailInvoice.length > 0 ? (

                    <div className="overflow-x-auto">

                        <table className="w-full text-left border-collapse">

                            <thead>
                                <tr className="bg-eco-white/60 text-forest-deep text-xs font-bold uppercase tracking-wider border-b border-sage-mist/20">

                                    <th className="py-3 px-6">
                                        No. Invoice
                                    </th>

                                    <th className="py-3 px-6">
                                        Tanggal Invoice
                                    </th>

                                    <th className="py-3 px-6 text-right">
                                        Terutang
                                    </th>

                                    <th className="py-3 px-6 text-right">
                                        Pembayaran
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-sage-mist/20 text-sm text-forest-deep">

                                {receipt.detailInvoice.map(
                                    (invoice, index) => (

                                        <tr key={index}>

                                            <td className="py-4 px-6 font-semibold">
                                                {invoice.invoiceNo ||
                                                    invoice.invoiceNumber ||
                                                    "-"}
                                            </td>

                                            <td className="py-4 px-6">
                                                {invoice.invoiceDate ||
                                                    "-"}
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                {invoice.owing !=
                                                    null
                                                    ? `Rp ${Number(
                                                        invoice.owing
                                                    ).toLocaleString(
                                                        "id-ID"
                                                    )}`
                                                    : "-"}
                                            </td>

                                            <td className="py-4 px-6 text-right font-semibold">
                                                Rp{" "}
                                                {Number(
                                                    invoice.paymentAmount ||
                                                    0
                                                ).toLocaleString(
                                                    "id-ID"
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="p-8 text-center text-gray-500">
                        Tidak ada detail invoice.
                    </div>

                )}

            </div>


            {/* Delete */}
            <div className="flex justify-end pt-2">

                <button
                    type="button"
                    onClick={() => {
                        // TODO:
                        // Implement DELETE endpoint
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
                >
                    Delete Receipt
                </button>

            </div>

        </div>
    );
}