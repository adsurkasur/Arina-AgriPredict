"use client";
import { toast as reactToastify } from "react-toastify";

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  type?: "success" | "error" | "warning" | "info";
}

export const toast = {
  success: (message: string, options?: Omit<ToastOptions, "type">) => {
    return reactToastify.success(message, {
      autoClose: options?.duration || 5000,
      ...options,
    });
  },

  error: (message: string, options?: Omit<ToastOptions, "type">) => {
    return reactToastify.error(message, {
      autoClose: options?.duration || 5000,
      ...options,
    });
  },

  warning: (message: string, options?: Omit<ToastOptions, "type">) => {
    return reactToastify.warning(message, {
      autoClose: options?.duration || 5000,
      ...options,
    });
  },

  info: (message: string, options?: Omit<ToastOptions, "type">) => {
    return reactToastify.info(message, {
      autoClose: options?.duration || 5000,
      ...options,
    });
  },

  // For backward compatibility with existing useToast hook
  default: (options: ToastOptions) => {
    const message = options.title
      ? `${options.title}${options.description ? `: ${options.description}` : ""}`
      : options.description || "Notification";

    switch (options.type) {
      case "success":
        return toast.success(message, { duration: options.duration });
      case "error":
        return toast.error(message, { duration: options.duration });
      case "warning":
        return toast.warning(message, { duration: options.duration });
      default:
        return toast.info(message, { duration: options.duration });
    }
  },
};

// Export the original toast function for direct use
export { reactToastify as toastify };
