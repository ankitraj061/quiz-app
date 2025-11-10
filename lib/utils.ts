import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9090"
} 