export const DEFAULT_HOURLY_RATE = 8;
export const DEFAULT_TIMEZONE = "Europe/Madrid";
export const DEFAULT_EMPLOYEE_NAME = "Javi";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}

