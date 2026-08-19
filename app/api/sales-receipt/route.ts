import { NextRequest, NextResponse } from "next/server";

// =========================================================
// GET Sales Receipt List
// GET /api/sales-receipt
// =========================================================

export async function GET(request: NextRequest) {
  const searchParams =
    request.nextUrl.searchParams;

  const queryString =
    searchParams.toString();

  const ACCURATE_TOKEN =
    process.env.ACCURATE_ACCESS_TOKEN || "";

  const ACCURATE_SESSION =
    process.env.ACCURATE_SESSION_ID || "";

  try {
    const response = await fetch(
      `https://zeus.accurate.id/accurate/api/sales-receipt/list.do?${queryString}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${ACCURATE_TOKEN}`,

          "X-Session-ID":
            ACCURATE_SESSION,

          "Content-Type":
            "application/json",
        },

        cache: "no-store",
      }
    );

    const data =
      await response.json();

    return NextResponse.json(
      data,
      {
        status: response.status,
      }
    );

  } catch (error) {

    console.error(
      "Sales receipt GET error:",
      error
    );

    return NextResponse.json(
      {
        s: false,
        message:
          "Gagal menghubungkan ke server Accurate",
      },
      {
        status: 500,
      }
    );
  }
}


// =========================================================
// POST / SAVE Sales Receipt
// POST /api/sales-receipt
// =========================================================

export async function POST(
  request: NextRequest
) {
  const ACCURATE_TOKEN =
    process.env.ACCURATE_ACCESS_TOKEN || "";

  const ACCURATE_SESSION =
    process.env.ACCURATE_SESSION_ID || "";

  try {

    // =====================================================
    // Ambil payload dari frontend
    // =====================================================

    const body =
      await request.json();

    console.log(
      "Sales Receipt POST Proxy:",
      JSON.stringify(
        body,
        null,
        2
      )
    );

    // =====================================================
    // POST ke Express
    // =====================================================

    const response = await fetch(
      "http://localhost:3001/api/sales-receipts",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(body),
      }
    );

    // Jangan langsung response.json()
    // supaya aman kalau backend mengembalikan response kosong
    const text =
      await response.text();

    console.log(
      "Express Sales Receipt Response:",
      text
    );

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Backend mengembalikan response kosong",
        },
        {
          status: 500,
        }
      );
    }

    let data;

    try {
      data = JSON.parse(text);

    } catch (error) {

      console.error(
        "Invalid JSON from Express:",
        text
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Backend mengembalikan response bukan JSON",
          rawResponse: text,
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // Return ke frontend
    // =====================================================

    return NextResponse.json(
      data,
      {
        status: response.status,
      }
    );

  } catch (error) {

    console.error(
      "Sales receipt POST proxy error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menyimpan sales receipt",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}