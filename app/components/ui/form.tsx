"use client";

import * as React from "react";
import { useFormContext, Controller, FieldValues, FieldPath } from "react-hook-form";

import { cn } from "@/lib/utils";

// ---------- Context ----------
type FormFieldContextValue = {
  id: string;
  name?: string;
  error?: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const useFormField = () => {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error("useFormField must be used within a FormField");
  }
  return context;
};

// ---------- Form ----------
type FormProps = React.FormHTMLAttributes<HTMLFormElement>;

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, onSubmit, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn("space-y-4", className)}
        onSubmit={onSubmit}
        {...props}
      />
    );
  }
);
Form.displayName = "Form";

// ---------- FormField ----------
type FormFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: FieldPath<TFieldValues>;
  control?: any;
  render: (props: any) => React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

function FormField<TFieldValues extends FieldValues>({
  name,
  control: controlProp,
  render,
  className,
  children,
}: FormFieldProps<TFieldValues>) {
  const contextControl = useFormContext<TFieldValues>()?.control;
  const control = controlProp || contextControl;

  if (!control) {
    throw new Error(
      "FormField must be used within a FormProvider or pass control prop"
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormFieldContext.Provider
          value={{
            id: field.name,
            name: field.name,
            error: fieldState.error?.message,
          }}
        >
          <div className={cn("space-y-1.5", className)}>
            {render ? render({ field, fieldState }) : children}
          </div>
        </FormFieldContext.Provider>
      )}
    />
  );
}

// ---------- FormItem ----------
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="form-item"
        className={cn("space-y-1.5", className)}
        {...props}
      />
    );
  }
);
FormItem.displayName = "FormItem";

// ---------- FormLabel ----------
type FormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, ...props }, ref) => {
    const { id, error } = useFormField();

    return (
      <label
        ref={ref}
        htmlFor={id}
        className={cn(
          "text-sm font-medium text-slate-900",
          error && "text-red-600",
          className
        )}
        {...props}
      >
        {children}
      </label>
    );
  }
);
FormLabel.displayName = "FormLabel";

// ---------- FormControl ----------
type FormControlProps = React.HTMLAttributes<HTMLDivElement>;

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, children, ...props }, ref) => {
    const { error } = useFormField();

    return (
      <div
        ref={ref}
        data-error={!!error}
        className={cn(
          "w-full",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormControl.displayName = "FormControl";

// ---------- FormMessage ----------
type FormMessageProps = React.HTMLAttributes<HTMLDivElement>;

const FormMessage = React.forwardRef<HTMLDivElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { error } = useFormField();

    if (!error) return null;

    return (
      <div
        ref={ref}
        className={cn("text-sm text-red-600 mt-1", className)}
        {...props}
      >
        {children || error}
      </div>
    );
  }
);
FormMessage.displayName = "FormMessage";

// ---------- Exports ----------
export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useFormField,
};