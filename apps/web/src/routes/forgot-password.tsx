import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const { mutate: forgotPassword, isPending } = authService.useForgotPassword({
    onSuccess: () => {
      setSent(true);
      toast.success("Password reset email sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    forgotPassword({ body: { email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">LabAI</h1>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border p-8">
          <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Enter your email and we'll send you a reset link.
          </p>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium mb-4">
                Check your email for a reset link!
              </p>
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
