"use client";
import { Input } from "@base-ui/react";

const TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "JPM"];
export default function SearchStocks() {
    return(
        <div className="flex flex-col items-center ">
            <Input className="w-120 bg-primary-background border border-b-2 px-4 mt-4" placeholder="Search any ticker..."/>
            <div className="">
                {TICKERS.map((item) => (
                    <div className="" key={item}>
                        
                    </div>
                ))}
            </div>
        </div>
    )
}