import { Children, cloneElement, isValidElement, type ReactElement } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "cn";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
  /** Extra props passed straight to the wrapping div (e.g. password row). */
  className?: string;
}

/**
 * Wraps one RHF-controlled input with a label, hint, and accessible error.
 * Validates against a11y basics: label is linked via htmlFor and the input
 * receives aria-invalid + aria-describedby pointing to hint/error nodes.
 */
export function FormField({ id, label, error, hint, children, className }: FormFieldProps) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") ||
    undefined;

  const child = Children.only(children);
  const wired = isValidElement(child)
    ? cloneElement(child, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })
    : child;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {wired}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
