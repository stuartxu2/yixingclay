import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchResultItem } from "./search-result-item";

// next/image renders an <img>; stub to a plain img for jsdom.
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

  it("calls onNavigate when the result is clicked", () => {
    const onNavigate = vi.fn();
    render(
      <SearchResultItem
        result={{
          id: "p3",
          title: "Clickable",
          handle: "c",
          thumbnail: null,
          price: 100,
          href: "/tea-pets/c",
        }}
        onNavigate={onNavigate}
      />,
    );
    fireEvent.click(screen.getByRole("link", { name: /clickable/i }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
