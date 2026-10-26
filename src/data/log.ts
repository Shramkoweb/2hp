interface LogEntry {
  month: string;
  kind: "win" | "flop";
  lead: string;
  text: string;
  lesson?: string;
}

export const log: LogEntry[] = [];
