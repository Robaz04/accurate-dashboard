"use client";

import { useEffect, useState } from "react";

interface Balance {
  balanceCode: string;
  balance: number;
}

interface Customer {
  id: number;
  accurateId: number;
  customerNo: string;
  name: string;
  email: string | null;
  mobilePhone: string | null;
  workPhone: string | null;
  balances: Balance[];
}

interface CustomerResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function CustomersPage() {
  const URL = process.env.NEXT_PUBLIC_MY_API;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${URL}/customers?page=${page}&limit=${pageSize}`,
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data customer");
        }

        const result: CustomerResponse = await response.json();

        setCustomers(result.data);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } catch (error) {
        console.error(error);
        setError("Gagal memuat data customer.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sage-mist/30 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-forest-deep">
            Master Customer
          </h1>
          <p className="text-sm text-emerald-moss/80">
            Lihat data customer dari Accurate.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm p-5">
        <p className="text-xs text-emerald-moss uppercase tracking-wider font-bold">
          Total Customer
        </p>

        <p className="text-2xl font-bold text-forest-deep mt-1">
          {total.toLocaleString()}
        </p>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-emerald-moss font-medium">
            Memuat data customer...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Data customer tidak ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-eco-white/60 text-forest-deep text-xs font-bold uppercase tracking-wider border-b border-sage-mist/20">
                  <th className="py-3 px-6">ID</th>

                  <th className="py-3 px-6">Nomor Customer</th>

                  <th className="py-3 px-6">Nama Customer</th>

                  <th className="py-3 px-6">Email</th>

                  <th className="py-3 px-6">Mobile Phone</th>

                  <th className="py-3 px-6">Balance</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sage-mist/20 text-sm text-forest-deep">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-eco-white/30 transition"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-emerald-moss">
                      {customer.accurateId}
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      {customer.customerNo}
                    </td>

                    <td className="py-4 px-6">{customer.name}</td>

                    <td className="py-4 px-6">{customer.email || "-"}</td>

                    <td className="py-4 px-6">
                      {customer.mobilePhone || customer.workPhone || "-"}
                    </td>

                    <td className="py-4 px-6">
                      {customer.balances.length === 0 ? (
                        "-"
                      ) : (
                        <div className="space-y-1">
                          {customer.balances.map((balance) => (
                            <div key={balance.balanceCode} className="text-xs">
                              <span className="font-semibold">
                                {balance.balanceCode}
                              </span>

                              <span className="ml-2 text-emerald-moss">
                                {balance.balance.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-sage-mist/20 flex items-center justify-between bg-eco-white/30">
          <p className="text-xs text-emerald-moss">
            Halaman <span className="font-bold">{page}</span> dari{" "}
            <span className="font-bold">{totalPages}</span>
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
              disabled={page >= totalPages}
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
