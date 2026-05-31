/**
 * Typed error thrown when an API call returns HTTP 401.
 * The React Query error handler in ReactQueryProvider catches this and
 * dispatches a "clerk:unauthorized" event, which AuthGuard picks up to
 * immediately redirect to sign-in — bridging the gap between an API 401
 * and Clerk's ~60-second session polling interval.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}
