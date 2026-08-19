import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:3001";

// =========================================================
// GET Sales Receipt Detail
// GET /api/sales-receipt/:id
// =========================================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `${BACKEND_URL}/api/sales-receipts/${encodeURIComponent(id)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Sales receipt detail proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail sales receipt",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================================================
// DELETE Sales Receipt
// DELETE /api/sales-receipt/:id
// =========================================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `${BACKEND_URL}/api/sales-receipts/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );

    const data = await response.json();

    console.log("Delete Sales Receipt:", data);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Sales receipt delete proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus sales receipt",
      },
      {
        status: 500,
      },
    );
  }
}
