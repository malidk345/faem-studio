"use client"

import type { Table } from "@tanstack/react-table"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddTask?: any // kept for backwards compatibility if used elsewhere
  searchKey?: string
}

export function DataTableToolbar<TData>({
  table,
  searchKey = "name"
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const searchValue = (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""

  return (
    <div className="w-full">
      <div className="relative flex items-center w-full">
        <Search className="absolute left-4 w-4 h-4 text-zinc-400" />
        <Input
          placeholder={searchKey === 'name' ? 'Ürün veya Müşteri Ara...' : searchKey === 'user' ? 'Müşteri adına göre Sipariş Ara...' : 'Ara...'}
          value={searchValue}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="w-full h-12 pl-10 pr-10 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-2xl text-[13px] font-medium transition-all"
        />
        {searchValue && (
          <button 
            onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
            className="absolute right-4 p-1 hover:bg-zinc-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        )}
      </div>
    </div>
  )
}
