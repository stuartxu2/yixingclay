import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// vitest has no `globals: true`, so Testing Library's auto-cleanup never
// registers. Unmount rendered trees between tests to keep the DOM isolated.
afterEach(() => {
  cleanup();
});
