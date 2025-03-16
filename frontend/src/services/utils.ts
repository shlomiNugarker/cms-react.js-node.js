export const isHebrew = (text: string) => /[\u0590-\u05FF]/.test(text);
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
