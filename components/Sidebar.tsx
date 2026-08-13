export default function Sidebar() {
    return (
        <aside className="w-64 bg-emerald-moss text-white p-4 border-r border-black">
            <h2 className="text-xl font-bold mb-4">Navigation</h2>
            <ul>
                <li className="mb-2 text-xl hover:text-raw-amber transform transition hover:scale-105">
                    <a href="/dashboard">
                        Sales Invoice
                    </a>
                </li>
                <li className="mb-2 text-xl hover:text-raw-amber transform transition hover:scale-105">
                    <a href="/profile">
                        Sales Quotation
                    </a>
                </li>
                <li className="mb-2 text-xl hover:text-raw-amber transform transition hover:scale-105">
                    <a href="/settings">
                        Sales Order
                    </a>
                </li>
            </ul>
        </aside>
    );
}