import { Children, cloneElement, isValidElement, type ReactElement } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "cn";

/** Props that link a form control to its label, hint, and error nodes. */
export interface FormFieldWiring {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /**
   * Single form control to wire up, or a render function when the control
   * needs a wrapper element (e.g. input + show/hide toggle) — the returned
   * node must attach `wiring` to the actual <input>.
   */
  children:
    | ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>
    | ((wiring: FormFieldWiring) => React.ReactNode);
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

  const wiring: FormFieldWiring = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  // Element children get cloned with the wiring; render-function children
  // receive the wiring so they can attach it to the real <input> themselves.
  let content: React.ReactNode;
  if (typeof children === "function") {
    content = children(wiring);
  } else {
    const child = Children.only(children);
    content = isValidElement(child) ? cloneElement(child, { ...wiring }) : child;
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {content}
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
