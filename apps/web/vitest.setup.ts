import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// vitest has no `globals: true`, so Testing Library's auto-cleanup never
// registers. Unmount rendered trees between tests to keep the DOM isolated.
afterEach(() => {
  cleanup();
});

// @testing-library/dom checks `typeof jest` to detect fake timers (jestFakeTimersAreEnabled).
// With vitest, `jest` is not a global, so the check fails and `waitFor`'s asyncWrapper
// hangs on a faked `setTimeout`. Expose `vi` as `jest` so the detection works.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;
