export function calculateExportDateRange(occurredAtIso: string): { dateFrom: string; dateTo: string } {
  const d = new Date(occurredAtIso);
  if (Number.isNaN(d.getTime())) {
    // Fallback if invalid date
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return {
      dateFrom: from.toISOString().split('T')[0],
      dateTo: now.toISOString().split('T')[0],
    };
  }

  // Define a 14-day window centered around the session
  const from = new Date(d);
  from.setDate(from.getDate() - 7);
  
  const to = new Date(d);
  to.setDate(to.getDate() + 7);

  // Return formatted YYYY-MM-DD
  return {
    dateFrom: from.toISOString().split('T')[0],
    dateTo: to.toISOString().split('T')[0],
  };
}
