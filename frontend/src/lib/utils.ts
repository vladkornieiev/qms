import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function formatCurrency(val: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(val);
}
