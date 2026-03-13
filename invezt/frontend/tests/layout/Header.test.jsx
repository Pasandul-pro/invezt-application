import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Header from "../../src/components/layout/Header.jsx";

function renderHeader(initialPath = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header />
    </MemoryRouter>,
  );
}

describe("Header", () => {
  it("renders the brand and main navigation links", () => {
    renderHeader();

    expect(screen.getByText("Invezt")).toBeInTheDocument();
    expect(screen.getByText("Investing Made Simple")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Compare" })).toBeInTheDocument();
  });

  it("highlights the active navigation link", () => {
    renderHeader("/compare");

    const compareLinks = screen.getAllByRole("link", { name: "Compare" });
    expect(compareLinks[0].className).toContain("bg-white/20");
  });

  it("links the brand back to the dashboard", () => {
    renderHeader();

    const brandLink = screen.getByRole("link", {
      name: /invezt logo inveztinvesting made simple/i,
    });
    expect(brandLink).toHaveAttribute("href", "/dashboard");
  });

  it("opens the mobile menu when the menu button is clicked", () => {
    const { container } = renderHeader();

    expect(screen.getAllByText("Logout")).toHaveLength(1);

    const menuButton = container.querySelector("button");
    fireEvent.click(menuButton);

    expect(screen.getAllByText("Logout")).toHaveLength(2);
  });

  it("closes the mobile menu after clicking a mobile link", () => {
    const { container } = renderHeader();

    const menuButton = container.querySelector("button");
    fireEvent.click(menuButton);
    const compareLinks = screen.getAllByRole("link", { name: "Compare" });
    fireEvent.click(compareLinks[1]);

    expect(screen.getAllByText("Logout")).toHaveLength(1);
  });
});
