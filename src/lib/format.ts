const utc = { timeZone: "UTC" } as const;

const month = new Intl.DateTimeFormat("en-US", {
  ...utc,
  month: "short",
  year: "numeric",
});
const day = new Intl.DateTimeFormat("en-US", {
  ...utc,
  month: "short",
  day: "numeric",
});
const date = new Intl.DateTimeFormat("en-US", {
  ...utc,
  month: "short",
  day: "numeric",
  year: "numeric",
});
const number = new Intl.NumberFormat("en-US");
const list = new Intl.ListFormat("en-US", { type: "unit", style: "short" });

export const formatMonth = (value: Date) => month.format(value);
export const formatDay = (value: Date) => day.format(value);
export const formatDate = (value: Date) => date.format(value);
export const formatNumber = (value: number) => number.format(value);
export const formatList = (values: readonly string[]) => list.format(values);
