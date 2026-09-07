import React from "react";

const EXAM_PRODUCTS = [
  {
    id: "aptis",
    label: "Aptis",
    href: "https://aptis-trainer.beeskillsenglish.com/",
  },
  {
    id: "ote",
    label: "OTE",
    href: "https://ote-seif.beeskillsenglish.com/",
  },
];

export default function ProductSwitcher({ hasAptisAccess = false, hasOteAccess = false }) {
  const availableProducts = EXAM_PRODUCTS.filter((product) =>
    product.id === "aptis" ? hasAptisAccess : hasOteAccess
  );

  if (!availableProducts.length) return null;

  return (
    <nav className="product-switcher" aria-label="Switch learning product">
      <span className="product-switcher__option is-active" aria-current="page">
        SeifHub
      </span>
      {availableProducts.map((product) => (
        <a
          className="product-switcher__option"
          href={product.href}
          key={product.id}
          title={`Switch to ${product.label}`}
        >
          {product.label}
        </a>
      ))}
    </nav>
  );
}
