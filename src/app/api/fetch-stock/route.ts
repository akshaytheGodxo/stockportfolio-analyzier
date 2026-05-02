import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return new Response(JSON.stringify({ error: "Ticker is required" }), {
      status: 400,
    });
  }

  const FETCH_STOCK_API = "https://stockportfolio-analyzier-3.onrender.com";

  const url = `${FETCH_STOCK_API}/analyze/${ticker}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as Record<string, unknown>;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Stock api error: ", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 },
    );
  }
}
