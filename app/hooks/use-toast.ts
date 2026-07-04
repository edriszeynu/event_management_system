"use client";

import { useToast as useToastInternal } from '@/components/ui/toast-provider';

// Adapter: map `showToast` -> `toast` to match existing usage.
export function useToast() {
  const { showToast, ...rest } = useToastInternal();
  return { toast: showToast, ...rest };
}

export default useToast;
