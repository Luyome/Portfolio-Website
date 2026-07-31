import LoginForm from "@/components/admin/LoginForm";
import BackToSiteButton from "@/components/admin/BackToSiteButton";

export default function AdminLoginPage() {
  return (
    <div className="adm-login">
      <div className="adm-title">Admin Login</div>
      <p className="adm-sub">Sign in to manage site content.</p>
      <LoginForm />
      <BackToSiteButton fixed />
    </div>
  );
}
