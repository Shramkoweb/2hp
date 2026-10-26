// Drops the `any` from Astro's JSX.Element, which typed lint rules read as an error type in .astro maps.
import "astro/astro-jsx";

declare global {
  namespace JSX {
    type Element = HTMLElement;
  }
}
