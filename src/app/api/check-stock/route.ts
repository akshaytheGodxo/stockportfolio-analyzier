'use server';

import {  NextResponse  } from "next/server";

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const symbol = searchParams.get("symbol") || "IBM";

    const API_KEY = process.env.ALPHA_VANTAGE_KEY

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`

    try {
        const res = await fetch(url);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({error: "Failed to fetch stock data"},
        {status: 500}
)
    }
}