"use client";

import { useEffect, useState } from "react";

interface Item {
    id: number;
    accurate_id: number;
    item_no: string | null;
    item_type: string | null;
    available_to_sell: string;
    name: string | null;
    upc_no: string | null;
}

interface ItemResponse {
    success: boolean;
    data: Item[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function ItemsPage() {
    const URL = process.env.NEXT_PUBLIC_MY_API;
    const [items, setItems] = useState<Item[]>([]);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);

    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${URL}/items?page=${page}&limit=${pageSize}`
                );

                if (!response.ok) {
                    throw new Error("Gagal mengambil data item");
                }

                const result: ItemResponse = await response.json();

                setItems(result.data);
                setTotal(result.pagination.total);
                setTotalPages(result.pagination.totalPages);
            } catch (error) {
                console.error(error);
                setError("Gagal memuat data item.");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [page, pageSize]);

    return (
        <div className="space-y-6">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-sage-mist/30 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-forest-deep">Master Item</h1>
                    <p className="text-sm text-emerald-moss/80">Lihat data item dari Accurate.</p>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm p-5">
                <p className="text-xs text-emerald-moss uppercase tracking-wider font-bold">
                    Total Item
                </p>

                <p className="text-2xl font-bold text-forest-deep mt-1">
                    {total.toLocaleString()}
                </p>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-sage-mist/30 shadow-sm overflow-hidden">

                {loading ? (
                    <div className="p-8 text-center text-emerald-moss font-medium">
                        Memuat data item...
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        {error}
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Data item tidak ditemukan.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left border-collapse">

                            <thead>
                                <tr className="bg-eco-white/60 text-forest-deep text-xs font-bold uppercase tracking-wider border-b border-sage-mist/20">

                                    <th className="py-3 px-6">
                                        ID
                                    </th>

                                    <th className="py-3 px-6">
                                        Nomor Item
                                    </th>

                                    <th className="py-3 px-6">
                                        Nama Item
                                    </th>

                                    <th className="py-3 px-6">
                                        Tipe
                                    </th>

                                    <th className="py-3 px-6">
                                        UPC
                                    </th>

                                    <th className="py-3 px-6 text-right">
                                        Available to Sell
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-sage-mist/20 text-sm text-forest-deep">

                                {items.map((item) => (

                                    <tr
                                        key={item.id}
                                        className="hover:bg-eco-white/30 transition"
                                    >

                                        {/* ID */}
                                        <td className="py-4 px-6 font-mono text-xs text-emerald-moss">
                                            {item.accurate_id}
                                        </td>

                                        {/* Item No */}
                                        <td className="py-4 px-6 font-semibold">
                                            {item.item_no || "-"}
                                        </td>

                                        {/* Name */}
                                        <td className="py-4 px-6">
                                            {item.name || "-"}
                                        </td>

                                        {/* Type */}
                                        <td className="py-4 px-6">

                                            <span className="inline-flex items-center rounded-full bg-eco-white px-2.5 py-1 text-xs font-semibold text-forest-deep border border-sage-mist/30">
                                                {item.item_type || "-"}
                                            </span>

                                        </td>

                                        {/* UPC */}
                                        <td className="py-4 px-6 font-mono text-xs">
                                            {item.upc_no || "-"}
                                        </td>

                                        {/* Stock */}
                                        <td className="py-4 px-6 text-right font-semibold">
                                            {item.available_to_sell || "-"}
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
                        Halaman{" "}
                        <span className="font-bold">
                            {page}
                        </span>{" "}
                        dari{" "}
                        <span className="font-bold">
                            {totalPages}
                        </span>
                    </p>

                    <div className="flex gap-2">

                        <button
                            disabled={page === 1}
                            onClick={() =>
                                setPage((prev) => Math.max(prev - 1, 1))
                            }
                            className="px-3 py-1.5 text-xs cursor-pointer text-forest-deep font-semibold rounded-lg border border-sage-mist/50 bg-white hover:bg-eco-white disabled:opacity-50 transition"
                        >
                            Sebelumnya
                        </button>

                        <button
                            disabled={page >= totalPages}
                            onClick={() =>
                                setPage((prev) => prev + 1)
                            }
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