import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { cn } from "@/lib/utils";

/**
 * A DialogContent wrapper that applies the dashboard theme class
 * so portaled modals inherit the correct light/dark tokens.
 */
const ThemedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, children, ...props }, ref) => {
  const { themeClass } = useDashboardTheme();
  return (
    <DialogContent ref={ref} className={cn(themeClass, className)} {...props}>
      {children}
    </DialogContent>
  );
});
ThemedDialogContent.displayName = "ThemedDialogContent";

export { ThemedDialogContent };
export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
