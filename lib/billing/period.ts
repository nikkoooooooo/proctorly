const MANILA_OFFSET_MINUTES = 8 * 60;

export function getManilaMonthBounds(now = new Date()) {
  const manilaNow = new Date(now.getTime() + MANILA_OFFSET_MINUTES * 60 * 1000);
  const year = manilaNow.getUTCFullYear();
  const month = manilaNow.getUTCMonth();

  const startUtcMs =
    Date.UTC(year, month, 1, 0, 0, 0) - MANILA_OFFSET_MINUTES * 60 * 1000;
  const endUtcMs =
    Date.UTC(year, month + 1, 1, 0, 0, 0) - MANILA_OFFSET_MINUTES * 60 * 1000;

  return {
    start: new Date(startUtcMs),
    end: new Date(endUtcMs),
  };
}
