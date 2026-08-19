"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface SalesInvoiceItem {
  id: number;
  number: string;
  dueDate: string;
  dueDateView: string;
  currency: Currency;
  totalAmount?: number;
  customerNo?: string;
  approvalStatus?: string;
}

export default function SalesInvoiceDashboard() {
  const [invoices, setInvoices] = useState<SalesInvoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Filter States
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Pagination States
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Function untuk Fetching Data dengan Dynamic Query Params
  const fetchInvoices = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      // Fields yang ingin diambil
      params.append(
        "fields",
        "id,number,dueDate,dueDateView,currency,totalAmount,customerNo,approvalStatus",
      );

      // Pagination
      params.append("sp.page", page.toString());
      params.append("sp.pageSize", pageSize.toString());

      // Search Keywords (Op: CONTAIN)
      if (debouncedSearch.trim()) {
        params.append("filter.keywords.op", "CONTAIN");
        params.append("filter.keywords.val", debouncedSearch.trim());
      }

      // Filter Currency
      if (currencyId) {
        params.append("filter.currencyId.op", "EQUAL");
        params.append("filter.currencyId.val", currencyId);
      }

      // Filter Due Date (Rentang Tanggal)
      if (startDate && endDate) {
        params.append("filter.dueDate.op", "BETWEEN");
        params.append("filter.dueDate.val[0]", startDate);
        params.append("filter.dueDate.val[1]", endDate);
      }

      // Filter Approval Status
      if (approvalStatus) {
        params.append("approvalStatusFilter", JSON.stringify([approvalStatus]));
      }

      // Sorting
      if (sortBy) {
        params.append("sort", `${sortBy === "asc" ? "+" : "-"}totalAmount`);
      }

      const res = await fetch(`/api/sales-invoice?${params.toString()}`);
      const result = await res.json();

      if (result.s && Array.isArray(result.d)) {
        setInvoices(result.d);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    currencyId,
    startDate,
    endDate,
    approvalStatus,
    sortBy,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sage-mist/30 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-forest-deep">
            Sales Invoices
          </h1>
          <p className="text-sm text-emerald-moss/80">
            Kelola dan filter data faktur penjualan Accurate.
          </p>
        </div>
        <button
          onClick={() => router.push("/create-sales")}
          className="px-4 py-2 bg-raw-amber text-emerald-moss font-semibold rounded-lg shadow hover:bg-amber-600 transition cursor-pointer"
        >
          New Invoice
        </button>
      </div>

      {/* Dynamic Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-sage-mist/30 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-forest-deep uppercase tracking-wider">
          Filter Data
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div>
            <label className="block text-xs font-semibold text-emerald-moss mb-1">
              Cari Keyword / No. Invoice
            </label>
            <input
              type="text"
              placeholder="Ketik kata kunci..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setPage(1); // Reset ke hal 1 saat filter berubah
              }}
              className="w-full px-3 py-2 bg-eco-white/50 border border-sage-mist/50 rounded-xl text-sm text-forest-deep focus:outline-none focus:ring-2 focus:ring-emerald-moss"
            />
          </div>

          {/* Currency Filter */}
          <div>
            <label className="block text-xs font-semibold text-emerald-moss mb-1">
              Mata Uang
            </label>
            <select
              value={currencyId}
              onChange={(e) => {
                setCurrencyId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-eco-white/50 border border-sage-mist/50 rounded-xl text-sm text-forest-deep focus:outline-none focus:ring-2 focus:ring-emerald-moss"
            >
              <option value="">Semua Currency</option>
              <option value="50">IDR (Rupiah)</option>
              <option value="51">USD (Dollar)</option>
            </select>
          </div>

          {/* Approval Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-emerald-moss mb-1">
              Status Persetujuan
            </label>
            <select
              value={approvalStatus}
              onChange={(e) => {
                setApprovalStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-eco-white/50 border border-sage-mist/50 rounded-xl text-sm text-forest-deep focus:outline-none focus:ring-2 focus:ring-emerald-moss"
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="UNAPPROVED">Unapproved</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="NEXTUSER_TOAPPROVED">Next User To Approve</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-emerald-moss mb-1">
              Jatuh Tempo Dari
            </label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-eco-white/50 border border-sage-mist/50 rounded-xl text-sm text-forest-deep focus:outline-none focus:ring-2 focus:ring-emerald-moss"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-emerald-moss mb-1">
              Jatuh Tempo Sampai
            </label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-eco-white/50 border border-sage-mist/50 rounded-xl text-sm text-forest-deep focus:outline-none focus:ring-2 focus:ring-emerald-moss"
            />
          </div>
          {/* Urutkan berdasarkan total amout */}
          <div>
            <label className="block text-xs font-semibold text-emerald-moss mb-1">
              Urutkan Berdasarkan Total Amount
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-eco-white/50 border border-sage-mist/50 rounded-xl text-sm text-forest-deep focus:outline-none focus:ring-2 focus:ring-emerald-moss"
            >
              <option value="">Default</option>
              <option value="totalAmount|asc">Ascending</option>
              <option value="totalAmount|desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-emerald-moss font-medium">
            Memuat data faktur...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Data faktur tidak ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-eco-white/60 text-forest-deep text-xs font-bold uppercase tracking-wider border-b border-sage-mist/20">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Nomor Invoice</th>
                  <th className="py-3 px-6">Nomor Customer</th>
                  <th className="py-3 px-6">Jatuh Tempo</th>
                  <th className="py-3 px-6">Mata Uang</th>
                  <th className="py-3 px-6">Status Approval</th>
                  <th className="py-3 px-6">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-mist/20 text-sm text-forest-deep">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => router.push(`/${inv.id}`)}
                    className="hover:bg-eco-white/30 transition hover:cursor-pointer"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-emerald-moss">
                      {inv.id}
                    </td>
                    <td className="py-4 px-6 font-semibold">{inv.number}</td>
                    <td className="py-4 px-6">{inv.customerNo}</td>
                    <td className="py-4 px-6">
                      {inv.dueDateView || inv.dueDate}
                    </td>
                    <td className="py-4 px-6 pl-12">{inv.currency?.code}</td>
                    <td className="py-4 px-6">{inv.approvalStatus}</td>
                    <td className="py-4 px-6">
                      {inv.totalAmount
                        ? `${inv.currency?.symbol} ${inv.totalAmount.toLocaleString()}`
                        : "-"}
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
              disabled={invoices.length < pageSize}
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
