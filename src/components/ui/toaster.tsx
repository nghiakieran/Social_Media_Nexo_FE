import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant: string | null | undefined) => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-success" />
      case "destructive":
        return <XCircle className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-warning" />
      case "info":
        return <Info className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-primary" />
      default:
        return <Info className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-muted-foreground" />
    }
  }

  const getVariantStyles = (variant: string | null | undefined) => {
    switch (variant) {
      case "success":
        return {
          bar: "bg-gradient-to-b from-success to-success/60",
          badge: "bg-success/15 ring-1 ring-success/20",
          progress: "bg-success/80",
        }
      case "destructive":
        return {
          bar: "bg-gradient-to-b from-destructive to-destructive/60",
          badge: "bg-destructive/15 ring-1 ring-destructive/20",
          progress: "bg-destructive/80",
        }
      case "warning":
        return {
          bar: "bg-gradient-to-b from-warning to-warning/60",
          badge: "bg-warning/15 ring-1 ring-warning/20",
          progress: "bg-warning/80",
        }
      case "info":
        return {
          bar: "bg-gradient-to-b from-primary to-primary/60",
          badge: "bg-primary/15 ring-1 ring-primary/20",
          progress: "bg-primary/80",
        }
      default:
        return {
          bar: "bg-muted-foreground/60",
          badge: "bg-muted/15 ring-1 ring-muted-foreground/10",
          progress: "bg-muted-foreground/60",
        }
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const styles = getVariantStyles(variant)

        return (
          <Toast key={id} variant={variant} {...props}>
            {/* 1. Refined Accent strip */}
            <div className={cn("absolute left-0 top-0 h-full w-[3px] opacity-80", styles.bar)} />

            <div className={cn("flex gap-4 max-sm:gap-2", title ? "items-start" : "items-center")}>
              {/* 2. Refined Icon badge with ring/depth */}
              <div className={cn("flex h-9 w-9 max-sm:h-7 max-sm:w-7 shrink-0 items-center justify-center rounded-xl transition-all duration-300", styles.badge)}>
                {getIcon(variant)}
              </div>

              <div className={cn("grid flex-1", title ? "gap-1.5" : "gap-0")}>
                {title && <ToastTitle className="text-[14px] max-sm:text-xs font-bold tracking-tight">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-xs max-sm:text-[11px] text-muted-foreground/90 leading-relaxed font-medium">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>


            {action}
            <ToastClose />

            {/* 3. Refined Progress bar */}
            <div className={cn("absolute bottom-0 left-0 h-[2px] rounded-full animate-progress", styles.progress)} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
