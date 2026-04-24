import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTemp = (temp: number) => `${temp.toFixed(1)}°C`;
export const formatPercent = (val: number) => `${(val * 100).toFixed(0)}%`;
