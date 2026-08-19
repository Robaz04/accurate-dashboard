import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { s: false, message: "ID diperlukan" },
      { status: 400 },
    );
  }

  const ACCURATE_TOKEN = process.env.ACCURATE_ACCESS_TOKEN || "";

  const ACCURATE_SESSION = process.env.ACCURATE_SESSION_ID || "";

  try {
    const response = await fetch(
      `https://zeus.accurate.id/accurate/api/sales-invoice/detail.do?id=${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ACCURATE_TOKEN}`,
          "X-Session-ID": ACCURATE_SESSION,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        s: false,
        message: "Gagal mengambil detail faktur",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================================================
// DELETE Sales Invoice
// DELETE /api/sales-invoice/detail?id=xxx
// =========================================================

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      {
        s: false,
        message: "ID diperlukan",
      },
      {
        status: 400,
      },
    );
  }

  const ACCURATE_TOKEN = process.env.ACCURATE_ACCESS_TOKEN || "";

  const ACCURATE_SESSION = process.env.ACCURATE_SESSION_ID || "";

  try {
    const response = await fetch(
      `https://zeus.accurate.id/accurate/api/sales-invoice/delete.do?id=${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${ACCURATE_TOKEN}`,
          "X-Session-ID": ACCURATE_SESSION,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    console.log("Accurate Delete Invoice Response:", data);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Delete invoice error:", error);

    return NextResponse.json(
      {
        s: false,
        message: "Gagal menghapus sales invoice",
      },
      {
        status: 500,
      },
    );
  }
}
