import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ColorPickerProps {
  label: string
  cssVar: string
  value: string
  onChange: (cssVar: string, value: string) => void
}

export function ColorPicker({ label, cssVar, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <Label className="text-xs font-medium flex-1">{label}</Label>
      <div className="flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded-md border border-border shadow-sm shrink-0" 
          style={{ backgroundColor: value || 'transparent' }}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(cssVar, e.target.value)}
          className="h-8 w-24 text-[10px] font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
