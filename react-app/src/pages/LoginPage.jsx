import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(form);
      pushToast("Login successful", "success");
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (error) {
      pushToast(error.message || "Login failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-container">
      <form className="auth-card" onSubmit={onSubmit}>
        <p className="auth-kicker">Welcome Back</p>
        <h1>Login to Warranty Tracer</h1>
        <p className="auth-subtitle">Monitor expiry dates, invoices, and warranty coverage effortlessly.</p>
        <input name="email" type="email" placeholder="Email" onChange={onChange} required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={onChange}
          required
        />
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
        <p className="auth-alt-text">
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </main>
  );
}

export default LoginPage;
