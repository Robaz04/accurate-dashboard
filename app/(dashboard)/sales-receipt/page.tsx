"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  customerNo: string;
  name: string;
}

interface Bank {
  name: string;
}

interface SalesReceiptItem {
  id: number;
  number: string;
  transDate: string;
  customer: Customer;
  bank: Bank;
  totalPayment?: number;
}

export default function SalesReceiptDashboard() {
  const [receipts, setReceipts] = useState<SalesReceiptItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Pagination States
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Function untuk Fetching Data dengan Dynamic Query Params
  const fetchInvoices = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      // Fields yang ingin diambil
      params.append("fields", "id,number,transDate,customer,bank,totalPayment");

      // Pagination
      params.append("sp.page", page.toString());
      params.append("sp.pageSize", pageSize.toString());

      const res = await fetch(`/api/sales-receipt?${params.toString()}`);
      const result = await res.json();

      if (result.s && Array.isArray(result.d)) {
        setReceipts(result.d);
      } else {
        setReceipts([]);
      }
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sage-mist/30 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-forest-deep">
            Sales Receipts
          </h1>
          <p className="text-sm text-emerald-moss/80">
            Kelola dan filter data tanda terima penjualan Accurate.
          </p>
        </div>
        <button
          onClick={() => router.push("/create-receipt")}
          className="px-4 py-2 bg-raw-amber text-emerald-moss font-semibold rounded-lg shadow hover:bg-amber-600 transition cursor-pointer"
        >
          New Receipt
        </button>
      </div>
      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-emerald-moss font-medium">
            Memuat data tanda terima...
          </div>
        ) : receipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Data tanda terima tidak ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-eco-white/60 text-forest-deep text-xs font-bold uppercase tracking-wider border-b border-sage-mist/20">
                  <th className="py-3 px-6">Nomor Receipt</th>
                  <th className="py-3 px-6">Tanggal Receipt</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Bank</th>
                  <th className="py-3 px-6">Total Dibayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-mist/20 text-sm text-forest-deep">
                {receipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    onClick={() => router.push(`sales-receipt/${receipt.id}`)}
                    className="hover:bg-eco-white/30 transition hover:cursor-pointer"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-emerald-moss">
                      {receipt.number}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {receipt.transDate}
                    </td>
                    <td className="py-4 px-6">{receipt.customer?.name}</td>
                    <td className="py-4 px-6">{receipt.bank?.name}</td>
                    <td className="py-4 px-6">
                      {receipt.totalPayment?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-sage-mist/20 flex items-center justify-between bg-eco-white/30">
          <p className="text-xs text-emerald-moss">
            Halaman <span className="font-bold">{page}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 text-xs cursor-pointer text-forest-deep font-semibold rounded-lg border border-sage-mist/50 bg-white hover:bg-eco-white disabled:opacity-50 transition"
            >
              Sebelumnya
            </button>
            <button
              disabled={receipts.length < pageSize}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1.5 text-xs cursor-pointer text-forest-deep font-semibold rounded-lg border border-sage-mist/50 bg-white hover:bg-eco-white disabled:opacity-50 transition"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
