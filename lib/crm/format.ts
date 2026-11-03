/* Formatting shared by CRM server pages and client components */

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  partially_paid: "Partially Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

