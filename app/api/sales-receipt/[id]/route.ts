import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:3001";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const response = await fetch(
            `${BACKEND_URL}/api/sales-receipts/${encodeURIComponent(id)}`,
            {
                method: "GET",
                cache: "no-store",
            }
        );

        const data = await response.json();

        return NextResponse.json(
            data,
            {
                status: response.status,
            }
        );

    } catch (error) {

        console.error(
            "Sales receipt detail proxy error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal mengambil detail sales receipt",
            },
            {
                status: 500,
            }
        );
    }
}