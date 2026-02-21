"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronRight, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export interface HelpSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function HelpSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <span className="font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4 text-sm space-y-3">{children}</div>}
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-mono font-medium bg-muted border rounded shadow-sm min-w-[1.5rem]">
      {children}
    </kbd>
  );
}

export function HelpImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="my-3 border rounded-lg overflow-hidden cursor-pointer group relative">
          <Image
            src={src}
            alt={alt}
            width={600}
            height={400}
            className="w-full h-auto"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-2">
              <ZoomIn className="h-5 w-5 text-foreground" />
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        className="p-2 block"
        style={{ maxWidth: "90vw", width: "fit-content" }}
      >
        <img src={src} alt={alt} className="max-h-[85vh] w-auto rounded" />
      </DialogContent>
    </Dialog>
  );
}
