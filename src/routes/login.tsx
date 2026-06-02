import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import axios, { AxiosError } from "axios";
import { Store, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
});

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    if (responseData && typeof responseData === "object" && "message" in responseData) {
      return (responseData as { message?: string }).message || "Failed to login";
    }
    if (typeof responseData === "string") {
      return responseData;
    }
    return error.message || "Failed to login";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error) || "Failed to login";
}

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
        phone,
        password,
      });
      const { token, user } = res.data;
      login(token, user);

      toast.success("Logged in successfully");
      navigate({ to: "/dashboard" });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setError(message);
      toast.error(message);
      console.error("Login error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 flex-col ">
      <div className=" relative w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-soft border border-border">
      {error && (
        <div className="absolute -top-5 justify-self-center self-center max-w-sm text-center  mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-900">
          {/* <p className="text-sm font-semibold">Login error</p> */}
          <p className="mt-1 text-sm">{error === "Invalid credentials" ? "Invalid phone number or password" : error}</p>
        </div>
      )}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
            <Store className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-display font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your loyalty dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="+1234567890"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Register your restaurant
          </Link>
        </p>
      </div>
    </div>
  );
}
