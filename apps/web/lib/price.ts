/**
 * Currency formatting — a presentation primitive shared by every surface that
 * shows money (cart, checkout, product cards, search results). Kept in its own
 * dependency-free module so non-product views don't import the whole product
 * catalogue just to format a number.
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
