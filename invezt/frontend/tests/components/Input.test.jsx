import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Input from "../../src/components/common/Input.jsx";

describe("Input", () => {
  it("renders a label when provided", () => {
    render(<Input label="Email Address" />);

    expect(screen.getByText("Email Address")).toBeInTheDocument();
  });

  it("does not render a label when omitted", () => {
    render(<Input placeholder="Enter email" />);

    expect(screen.queryByText("Email Address")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("applies type and custom classes", () => {
    const { container } = render(
      <Input type="password" className="border-red-500" />,
    );

    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "password");
    expect(input.className).toContain("input");
    expect(input.className).toContain("border-red-500");
  });

  it("forwards change handlers to the input element", () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Ticker" onChange={handleChange} />);

    fireEvent.change(screen.getByPlaceholderText("Ticker"), {
      target: { value: "JKH" },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
