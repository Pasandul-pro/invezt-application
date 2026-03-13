import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Card from "../../src/components/common/Card.jsx";

describe("Card", () => {
  it("renders its children", () => {
    render(
      <Card>
        <p>Portfolio summary</p>
      </Card>,
    );

    expect(screen.getByText("Portfolio summary")).toBeInTheDocument();
  });

  it("merges the base class with custom class names", () => {
    render(<Card className="shadow-2xl">Content</Card>);

    const card = screen.getByText("Content").closest("div");
    expect(card).toHaveClass("card");
    expect(card).toHaveClass("shadow-2xl");
  });
});
