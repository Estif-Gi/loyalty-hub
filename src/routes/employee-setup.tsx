import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export const Route = createFileRoute("/employee-setup")({
  component: EmployeeSetup,
});

function EmployeeSetup() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [uniqueId, setUniqueId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get("name");
    if (nameParam) setName(nameParam);
  }, []);

  const handleRegister = async () => {
    try {
      setStatus("loading");
      const generatedId = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedPassword = Math.random().toString(36).slice(-8);

      await api.post("/users/register", {
        name: name || "Employee",
        phone: generatedId,
        password: generatedPassword,
        role: "employee",
      });

      setUniqueId(generatedId);
      setPassword(generatedPassword);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border p-8 rounded-3xl shadow-soft text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-display mb-2 text-foreground">Welcome aboard, {name}!</h1>
          <p className="text-muted-foreground mb-8">
            Your employee account has been created. Please save your login credentials below.
          </p>

          <div className="bg-secondary/50 p-5 rounded-2xl space-y-4 mb-8 text-left border border-border/50">
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                Your Unique ID (Login)
              </p>
              <p className="font-mono text-xl font-medium text-foreground">{uniqueId}</p>
            </div>
            <div className="h-px bg-border/50 w-full" />
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                Your Password
              </p>
              <p className="font-mono text-xl font-medium text-foreground">{password}</p>
            </div>
          </div>

          <a
            href="/login"
            className="inline-block w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border p-8 rounded-3xl shadow-soft text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-display mb-2 text-foreground">Employee Setup</h1>
        <p className="text-muted-foreground mb-8">
          Welcome <strong>{name ? name : "to the team"}</strong>! Click below to generate your
          unique ID and complete your account setup.
        </p>

        {status === "error" && (
          <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
            An error occurred. Please make sure the backend is running and try again.
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={status === "loading"}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Account...
            </span>
          ) : (
            "Create My Account"
          )}
        </button>
      </div>
    </div>
  );
}
