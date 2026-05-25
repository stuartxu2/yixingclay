import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchResultItem } from "./search-result-item";

// next/image renders an <img>; stub to a plain img for jsdom.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as Record<string, string>)} />;
  },
}));

describe("SearchResultItem", () => {
  it("renders title, price, and a link to the hit href", () => {
    render(
      <SearchResultItem
        result={{
          id: "p1",
          title: "The White Cat",
          handle: "cat",
          thumbnail: "https://x/cat.jpg",
          price: 6800,
          href: "/tea-pets/cat",
        }}
      />,
    );

    expect(screen.getByText("The White Cat")).toBeInTheDocument();
    expect(screen.getByText("$68.00")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tea-pets/cat");
  });

  it("renders without a thumbnail", () => {
    render(
      <SearchResultItem
        result={{
          id: "p2",
          title: "No Image",
          handle: "x",
          thumbnail: null,
          price: 0,
          href: "/tea-pets/x",
        }}
      />,
    );
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });
});
