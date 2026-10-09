/// <reference types="astro/client" />

import type { AdminSessionUser } from './lib/auth';

declare global {
  namespace App {
    interface Locals {
      /** Set by src/middleware.ts on guarded /admin routes. */
      admin: AdminSessionUser | null;
    }

    interface SessionData {
      admin: AdminSessionUser;
    }
  }
}

export {};
