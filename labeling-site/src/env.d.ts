/// <reference path="../.astro/types.d.ts" />
 
declare namespace App {
    // Note: 'import {} from ""' syntax does not work in .d.ts files.
    interface Locals {
		session: import("./auth/session").AuthSessionType | null;
    }
}