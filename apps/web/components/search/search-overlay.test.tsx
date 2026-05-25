import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { searchMock, pushMock } = vi.hoisted(() => ({
  searchMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("@/lib/search", () => ({ searchProducts: searchMock }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    sizes,
    className,
  }: {
    src: string;
    alt: string;
    sizes?: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} sizes={sizes} className={className} />
  ),
}));

import { SearchOverlay } from "./search-overlay";

beforeEach(() => {
  searchMock.mockReset();
  pushMock.mockReset();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

function openOverlay() {
  render(<SearchOverlay />);
  fireEvent.click(screen.getByRole("button", { name: /search/i }));
}

describe("SearchOverlay", () => {
  it("opens to an idle state with no API call", () => {
    openOverlay();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("debounces input then renders results", async () => {
    searchMock.mockResolvedValue([
      {
        id: "p1",
        title: "The White Cat",
        handle: "cat",
        thumbnail: null,
        price: 6800,
        href: "/tea-pets/cat",
      },
    ]);
    openOverlay();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "cat" } });
    // Not called before the debounce window elapses.
    expect(searchMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(searchMock).toHaveBeenCalledWith("cat");
    // Switch to real timers so findBy's polling (and React's scheduler) run
    // normally instead of hanging on the faked clock.
    vi.useRealTimers();
    expect(await screen.findByText("The White Cat")).toBeInTheDocument();
  });

  it("shows a no-results state when search returns []", async () => {
    searchMock.mockResolvedValue([]);
    openOverlay();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzz" } });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    vi.useRealTimers();
    expect(await screen.findByText(/no results/i)).toBeInTheDocument();
  });

  it("closes on Esc", () => {
    openOverlay();
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("routes to /search on Enter", () => {
    openOverlay();
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "cat" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(pushMock).toHaveBeenCalledWith("/search?q=cat");
  });
});
