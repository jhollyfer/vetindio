import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Meta } from "./entities";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MetaDefault: Meta = {
  total: 1,
  perPage: 50,
  page: 1,
  lastPage: 1,
  firstPage: 1,
};
