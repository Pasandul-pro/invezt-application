import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Button from "../../src/components/common/Button.jsx";

describe("Button", () => {
  it("renders children and primary variant classes by default", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("btn");
    expect(button.className).toContain("btn-primary");
  });

  it("applies custom classes and calls onClick", () => {
    const handleClick = vi.fn();

    render(
      <Button variant="danger" className="w-full" onClick={handleClick}>
        Delete
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(button);

    expect(button.className).toContain("bg-red-600");
    expect(button.className).toContain("w-full");
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
