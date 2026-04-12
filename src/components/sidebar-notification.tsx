"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "./logo"

export function SidebarNotification() {
  const [isVisible, setIsVisible] = React.useState(true)

  if (!isVisible) return null

  return (
    <Card className="mb-3 py-0 border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      <CardContent className="p-5 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-7 w-7 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close notification</span>
        </Button>
        
        <div className="pr-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-black rounded-full" />
            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
               Studio Intelligence
            </h3>
          </div>
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Your collection architecture is live. Track curation performance and manage assets with pure precision.
          </p>
          <div className="flex items-center gap-4 pt-1">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-zinc-400 leading-none">Status</span>
                <span className="text-[12px] font-bold text-emerald-500">Live</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-zinc-400 leading-none">Node</span>
                <span className="text-[12px] font-bold text-zinc-900">Main-Core</span>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
