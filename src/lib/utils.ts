import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAppUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return ""
}

export function assetUrl(path: string) {
  if (path.startsWith("http")) return path
  return `/${path.replace(/^\//, "")}`
}
