declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }

  export class StatementSync {
    run(...params: Array<string | number | bigint | null | Uint8Array>): {
      changes: number;
      lastInsertRowid: number | bigint;
    };
    get(...params: Array<string | number | bigint | null | Uint8Array>): Record<string, unknown> | undefined;
    all(...params: Array<string | number | bigint | null | Uint8Array>): Record<string, unknown>[];
  }
}
