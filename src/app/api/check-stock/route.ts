import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const API_KEY = process.env.ALPHA_VANTAGE_KEY;

    if (!API_KEY) {
        console.error('ALPHA_VANTAGE_KEY is not set');
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = (await res.json()) as Record<string, unknown>;
        
        console.log(`Stock API Response for ${symbol}:`, data);
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Stock API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}