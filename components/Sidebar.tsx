'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            name: 'Sales Invoice',
            href: '/',
            activePaths: ['/', '/create-sales']
        },
        {
            name: 'Master Customer',
            href: '/customers',
            activePaths: ['/customers']
        },
        {
            name: 'Master Item',
            href: '/items',
            activePaths: ['/items']
        },
        {
            name: 'Sales Receipt',
            href: '/sales-receipt',
            activePaths: ['/sales-receipt', '/create-receipt']
        }
    ];

    return (
        <aside className="w-64 bg-emerald-moss text-white p-4 border-r border-black">
            <h2 className="text-xl font-bold mb-4">Navigation</h2>
            {menuItems.map((item) => {
                // Cek apakah pathname saat ini ada di dalam list activePaths
                const isActive = item.activePaths.includes(pathname);

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`block mb-2 py-2 px-4 rounded-lg transition-colors ${isActive
                            ? 'bg-raw-amber text-emerald-moss'
                            : 'hover:bg-raw-amber hover:text-emerald-moss'
                            }`}
                    >
                        {item.name}
                    </Link>
                );
            })}
        </aside>
    );
}