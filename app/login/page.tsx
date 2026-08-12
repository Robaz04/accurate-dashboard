'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [inputToken, setInputToken] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const validToken = process.env.NEXT_PUBLIC_STATIC_TOKEN;

        if (inputToken === validToken) {
            // Simpan token ke cookie (berlaku 1 hari)
            document.cookie = `auth_token=${inputToken}; path=/; max-age=86400; SameSite=Lax`;

            // Redirect ke dashboard
            router.push('/');
            router.refresh();
        } else {
            setError('Token tidak valid! Silakan coba lagi.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-eco-white px-4">
            {/* Container Card */}
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-forest-deep/5 border border-sage-mist/20">

                {/* Header / Logo Ilustrasi */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-moss/10 text-emerald-moss mb-3">
                        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-forest-deep tracking-tight">Accurate Dashboard</h2>
                    <p className="text-sm text-sage-mist/80 mt-1">Sistem Pemantauan Kehutanan Modern</p>
                </div>

                {/* Form Login */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="token" className="block text-sm font-semibold text-forest-deep mb-2">
                            Security Token
                        </label>
                        <input
                            type="password" // Diubah ke password agar karakter token tersembunyi demi keamanan
                            id="token"
                            value={inputToken}
                            onChange={(e) => setInputToken(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-sage-mist/30 text-forest-deep placeholder-sage-mist/60 focus:outline-none focus:ring-2 focus:ring-emerald-moss/20 focus:border-emerald-moss transition-all"
                            placeholder="Masukkan token akses Anda..."
                            required
                        />
                    </div>

                    {/* Pesan Error */}
                    {error && (
                        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    {/* Tombol Masuk */}
                    <button
                        type="submit"
                        className="w-full bg-emerald-moss hover:bg-forest-deep hover:cursor-pointer text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-moss/10 transition-all duration-200 transform active:scale-[0.98]"
                    >
                        Masuk ke Dashboard
                    </button>
                </form>

            </div>
        </div>
    );
}