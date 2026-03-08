// Placeholder para futura integración con Tidio API.
// Futuro: sincronizar tickets diarios/mensuales y KPIs por franja horaria.

export type TidioDailyStat = {
  date: string;
  tickets_responded: number;
  tickets_month_total: number;
  avg_time_per_ticket_seconds: number;
  tickets_per_hour: number;
};

export async function syncTidioDailyStats(): Promise<void> {
  // TODO: implementar cliente Tidio API y persistencia en ticket_stats.
  return Promise.resolve();
}

