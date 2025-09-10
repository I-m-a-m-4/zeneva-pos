"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

// Define the possible variant values
type ToastVariant = "success" | "destructive" | "default";

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = {
          success: <CheckCircle2 className="h-6 w-6 text-green-600" />,
          destructive: <AlertTriangle className="h-6 w-6 text-destructive" />,
          default: <Info className="h-6 w-6 text-primary" />,
        }[variant as ToastVariant || "default"]

        return (
          <Toast key={id} variant={variant as ToastVariant} {...props}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5">{Icon}</span>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}