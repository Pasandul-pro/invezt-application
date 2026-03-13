import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "../../src/contexts/AuthContext.jsx";
import {
  login as apiLogin,
  register as apiRegister,
} from "../../src/api/authApi.js";

vi.mock("../../src/api/authApi.js", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

function AuthProbe() {
  const { user, token, loading, login, logout, register } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="username">{user?.username || "guest"}</span>
      <span data-testid="token">{token || "no-token"}</span>
      <button onClick={() => login("user@example.com", "secret")}>Login</button>
      <button onClick={() => register("omisha", "user@example.com", "secret")}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts loading and then finishes initialization", async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });

  it("restores a saved session from localStorage", async () => {
    localStorage.setItem("token", "saved-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: "1",
        username: "saved-user",
        email: "saved@example.com",
      }),
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("saved-user");
      expect(screen.getByTestId("token")).toHaveTextContent("saved-token");
    });
  });

  it("clears malformed saved user data", async () => {
    localStorage.setItem("token", "saved-token");
    localStorage.setItem("user", "not-json");

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("guest");
    });
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("logs in and stores the returned user and token", async () => {
    apiLogin.mockResolvedValue({
      _id: "7",
      username: "logged-in",
      email: "user@example.com",
      token: "api-token",
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Login" }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("logged-in");
      expect(screen.getByTestId("token")).toHaveTextContent("api-token");
    });
    expect(apiLogin).toHaveBeenCalledWith("user@example.com", "secret");
    expect(localStorage.getItem("token")).toBe("api-token");
  });

  it("registers and stores the returned user and token", async () => {
    apiRegister.mockResolvedValue({
      _id: "9",
      username: "registered",
      email: "user@example.com",
      token: "register-token",
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Register" }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("registered");
      expect(screen.getByTestId("token")).toHaveTextContent("register-token");
    });
    expect(apiRegister).toHaveBeenCalledWith(
      "omisha",
      "user@example.com",
      "secret",
    );
  });

  it("logs out and clears the stored session", async () => {
    localStorage.setItem("token", "saved-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: "1",
        username: "saved-user",
        email: "saved@example.com",
      }),
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("saved-user");
    });

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(screen.getByTestId("username")).toHaveTextContent("guest");
    expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
