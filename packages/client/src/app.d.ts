// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
  namespace App {
    interface Error {
      id: string;
      message: string;
    }
    interface Locals {
      orgSlug: string | null;
    }
    // interface PageData {}
    interface PageState {
      modalOpen?: boolean;
      ticketId?: string;
      sheetOpen?: boolean;
      [key: string]: unknown;
    }
    // interface Platform {}
  }
}

export {};
