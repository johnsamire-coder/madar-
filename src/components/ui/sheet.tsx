"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetTitle = SheetPrimitive.Title;
const SheetDescription = SheetPrimitive.Description;

function SheetContent({ className, children, ...props }: React.ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-[#10232a]/50 backdrop-blur-[3px]" />
      <SheetPrimitive.Content dir="rtl" className={cn("sheet-content fixed inset-y-0 right-0 z-50 flex w-[min(310px,88vw)] flex-col overflow-y-auto bg-[#172830] p-5 text-white shadow-2xl focus:outline-none", className)} {...props}>
        {children}
        <SheetPrimitive.Close className="absolute top-6 left-4 inline-flex size-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">
          <X className="size-5" aria-hidden="true" />
          <span className="sr-only">إغلاق القائمة</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription };
