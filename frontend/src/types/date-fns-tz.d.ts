declare module 'date-fns-tz' {
  export function format(
    date: Date,
    formatStr: string,
    options?: { timeZone?: string; locale?: any },
  ): string
  export function utcToZonedTime(date: Date, timeZone: string): Date
}
