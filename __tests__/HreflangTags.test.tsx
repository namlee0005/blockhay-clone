/**
 * Unit tests for HreflangTags RSC.
 * Run with: npx jest  (requires jest + @testing-library/react setup)
 */
import React from "react";
import { render } from "@testing-library/react";
import HreflangTags from "../src/components/HreflangTags";

const BASE = "https://blockhay.com";

describe("HreflangTags", () => {
  it("emits hreflang=vi with the base vi URL", () => {
    const { container } = render(<HreflangTags pathname="/tin-tuc/my-slug" />);
    const vi = container.querySelector('link[hreflang="vi"]') as HTMLLinkElement;
    expect(vi).not.toBeNull();
    expect(vi.href).toBe(`${BASE}/tin-tuc/my-slug`);
  });

  it("emits hreflang=en with /en/ prefix", () => {
    const { container } = render(<HreflangTags pathname="/tin-tuc/my-slug" />);
    const en = container.querySelector('link[hreflang="en"]') as HTMLLinkElement;
    expect(en).not.toBeNull();
    expect(en.href).toBe(`${BASE}/en/tin-tuc/my-slug`);
  });

  it("emits x-default pointing to the vi URL", () => {
    const { container } = render(<HreflangTags pathname="/tin-tuc/my-slug" />);
    const xd = container.querySelector('link[hreflang="x-default"]') as HTMLLinkElement;
    expect(xd).not.toBeNull();
    expect(xd.href).toBe(`${BASE}/tin-tuc/my-slug`);
  });

  it("handles root pathname correctly", () => {
    const { container } = render(<HreflangTags pathname="/" />);
    const vi = container.querySelector('link[hreflang="vi"]') as HTMLLinkElement;
    const en = container.querySelector('link[hreflang="en"]') as HTMLLinkElement;
    expect(vi.href).toBe(`${BASE}/`);
    expect(en.href).toBe(`${BASE}/en/`);
  });

  it("handles category pages", () => {
    const { container } = render(<HreflangTags pathname="/phan-tich" />);
    const vi = container.querySelector('link[hreflang="vi"]') as HTMLLinkElement;
    expect(vi.href).toBe(`${BASE}/phan-tich`);
  });
});
