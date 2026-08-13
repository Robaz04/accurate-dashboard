'use client';

import { useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();

    const handleLogout = () => {
        // Hapus cookie auth_token
        document.cookie = 'auth_token=; path=/; max-age=0';
        router.push('/login');
        router.refresh();
    };
    return (
        <header className="flex items-center justify-between p-4 bg-emerald-moss text-white">
            <h1 className="text-xl font-bold">Accurate Dashboard</h1>
            <button onClick={handleLogout} className="bg-red-500 hover:cursor-pointer hover:bg-red-700 text-white font-bold py-2 px-4 rounded transform transition hover:scale-105">
                Logout
            </button>
        </header>
    );
}