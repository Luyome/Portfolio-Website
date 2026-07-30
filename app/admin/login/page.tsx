import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="adm-login">
      <div className="adm-title">Admin Login</div>
      <p className="adm-sub">Sign in to manage site content.</p>
      <LoginForm />
    </div>
  );
}
