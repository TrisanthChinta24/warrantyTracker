import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const onChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(form);
      pushToast("Account created. Please login.", "success");
      navigate("/login");
    } catch (error) {
      pushToast(error.message || "Registration failed", "error");
    }
  };

  return (
    <main className="auth-container">
      <form className="auth-card" onSubmit={onSubmit}>
        <p className="auth-kicker">Get Started</p>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Securely save all product warranties and never miss an expiry.</p>
        <input name="name" type="text" placeholder="Name" onChange={onChange} required />
        <input name="email" type="email" placeholder="Email" onChange={onChange} required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={onChange}
          required
        />
        <button className="btn btn-primary" type="submit">
          Create account
        </button>
        <p className="auth-alt-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}

export default RegisterPage;
