'use client';

import { useEffect, useState, use } from 'react';

interface DetailInvoice {
    id: number;
    number: string;
    transDate: string;
    dueDate: string;
    statusOutstanding: string;
    customer?: { name: string; customerNo: string };
    currency?: { symbol: string; code: string };
    totalAmount?: number;
    description?: string;
    approvalStatus?: string;
    detailItem?: Array<{
        item: { name: string; no: string };
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        detailTaxName?: string;
        primeOwing?: number;
        cashDiscount?: number;
    }>;
    detailTax?: Array<{
        taxableAmount: string;
        transId: number;
        taxAmount: string;
        taxRate: string;
    }>;
}

export default function SalesInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapped params menggunakan React.use() untuk Next.js App Router terbaru
    const { id } = use(params);

    const [detail, setDetail] = useState<DetailInvoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/sales-invoice/detail?id=${id}`);
                const result = await res.json();
                if (result.s && result.d) {
                    setDetail(result.d);
                }
            } catch (err) {
                console.error('Failed to load detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-emerald-moss font-medium">Memuat data faktur...</div>;
    }

    if (!detail) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 font-medium">Gagal memuat detail faktur. Silakan coba lagi nanti.</p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                >
                    Kembali ke Daftar Invoice
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header Bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => window.history.back()}
                    className="text-emerald-600 flex items-center gap-1 transition hover:text-emerald-800 cursor-pointer"
                >
                    Kembali ke Dashboard
                </button>
                <span className="text-sm text-gray-500">ID: {detail.id}</span>
            </div>

            {/* Invoice Header Card */}
            <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{detail.number}</h1>
                        <p className="text-gray-600">Customer: {detail.customer?.name || '-'}</p>
                    </div>
                    <div className="flex items-end gap-6">
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total Pajak</p>
                            <p className="text-xl font-bold text-emerald-600">
                                {detail.currency?.symbol || 'Rp'}{' '}
                                {detail.detailTax && detail.detailTax[0]
                                    ? Number(detail.detailTax[0].taxAmount).toLocaleString('id-ID')
                                    : 0}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total Transaksi</p>
                            <p className="text-xl font-bold text-emerald-600">
                                {detail.currency?.symbol || 'Rp'} {detail.totalAmount?.toLocaleString('id-ID') || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t text-sm">
                    <div>
                        <p className="text-gray-500">Tanggal Transaksi</p>
                        <p className="font-medium text-gray-800">{detail.transDate || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Jatuh Tempo</p>
                        <p className="font-medium text-gray-800">{detail.dueDate || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Mata Uang</p>
                        <p className="font-medium text-gray-800">{detail.currency?.code || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Status Lunas</p>
                        <p className="font-medium text-gray-800">{detail.statusOutstanding || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Status Approved</p>
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                            {detail.approvalStatus || 'APPROVED'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            {
                detail.detailItem && detail.detailItem.length > 0 && (
                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-gray-50">
                            <h2 className="font-semibold text-gray-700">Rincian Barang / Jasa</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b text-gray-600 font-medium">
                                        <th className="p-3">Nama Barang</th>
                                        <th className="p-3">Kode Barang</th>
                                        <th className="p-3 text-center">Jumlah</th>
                                        <th className="p-3 text-right">Harga Satuan</th>
                                        <th className="p-3 text-center">Diskon</th>
                                        <th className="p-3 text-center">Pajak</th>
                                        <th className="p-3 text-right">Total Harga</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-gray-700">
                                    {detail.detailItem.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-3">{item.item?.name || '-'}</td>
                                            <td className="p-3">{item.item?.no || '-'}</td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right">
                                                {detail.currency?.symbol || 'Rp'} {item.unitPrice?.toLocaleString('id-ID')}
                                            </td>
                                            <td className="p-3 text-center">
                                                {item.cashDiscount !== undefined ? `${item.cashDiscount.toFixed(2)}%` : '-'}
                                            </td>
                                            <td className="p-3 text-center">
                                                <p>{item.detailTaxName}</p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {detail.currency?.symbol || 'Rp'}{' '}
                                                    {(() => {
                                                        const taxData = detail.detailTax?.[0];
                                                        if (taxData) {
                                                            const totalPrice = Number(item.totalPrice) || 0;
                                                            const rate = Number(taxData.taxRate) || 0;
                                                            const totalTaxCalculated = (totalPrice * rate) / 100;
                                                            return totalTaxCalculated.toLocaleString('id-ID');
                                                        }
                                                        return '0';
                                                    })()}
                                                </p>
                                            </td>
                                            <td className="p-3 text-right font-medium">
                                                {detail.currency?.symbol || 'Rp'}{' '}
                                                {(Number(item.totalPrice) || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
        </div >
    );
}