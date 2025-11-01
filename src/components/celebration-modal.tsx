"use client"

import type React from "react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import { useState } from "react"

interface CelebrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function CelebrationModal({ open, onOpenChange, children }: CelebrationModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain) {
      // Store preference in localStorage or send to backend
      console.log("User opted out of this celebration")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-0">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-12">{children}</div>

        <div className="px-12 pb-8 flex items-center justify-center">
          <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
            <Checkbox checked={dontShowAgain} onCheckedChange={(checked) => setDontShowAgain(checked as boolean)} />
            <span>Don't show this again</span>
          </label>
        </div>
      </DialogContent>
    </Dialog>
  )
}
