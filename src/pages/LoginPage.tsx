import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import {
  AlertCircle,
  CheckCircle,
  Lock,
  Mail,
  PersonStanding,
} from "lucide-react";
import { loginUser, registerUser } from "../data/api";
import { useNavigate } from "react-router-dom";
import { useUser, type User } from "../hooks/useUser";

type AlertType = "success" | "error";

interface AlertState {
  type: AlertType;
  message: string;
}

function AuthHeader({
  mode,
  setMode,
}: {
  mode: string;
  setMode: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex pb-6">
      <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-background-light dark:bg-background-dark p-1">
        <button
          onClick={() => setMode("login")}
          className={`flex h-full grow items-center justify-center rounded-md px-2 text-sm font-medium leading-normal
            ${
              mode === "login"
                ? "bg-container-light dark:bg-container-dark text-text-light dark:text-text-dark shadow-sm"
                : "text-subtle-light dark:text-subtle-dark"
            }`}
        >
          Log In
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex h-full grow items-center justify-center rounded-md px-2 text-sm font-medium leading-normal
            ${
              mode === "register"
                ? "bg-container-light dark:bg-container-dark text-text-light dark:text-text-dark shadow-sm"
                : "text-subtle-light dark:text-subtle-dark"
            }`}
        >
          Register
        </button>
      </div>
    </div>
  );
}

function AuthForm({
  mode,
  onAlert,
}: {
  mode: string;
  onAlert: (alert: AlertState) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const loginResponse = await loginUser(email, password);
        console.log("Login Response:", loginResponse);
        if ((loginResponse as { error?: string }).error) {
          onAlert({
            type: "error",
            message: loginResponse.message || "Login failed.",
          });
        } else {
          setUser(
            (loginResponse as unknown as { data: { user: User } }).data.user
          );
          onAlert({ type: "success", message: loginResponse.message });
          navigate("/");
        }
      } else {
        if (!email || !password || !name) {
          onAlert({
            type: "error",
            message: "Please fill in all required fields.",
          });
          return;
        }

        const registerResponse = await registerUser(
          email,
          password,
          name,
          role
        );
        if ((registerResponse as { error?: string }).error) {
          onAlert({
            type: "error",
            message: registerResponse.message || "Registration failed.",
          });
        } else {
          onAlert({ type: "success", message: "Registration successful." });
          navigate("/");
        }
      }
    } catch {
      onAlert({ type: "error", message: "Unexpected server error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col">
        <p className="pb-2 text-sm font-medium">Email</p>
        <div className="flex w-full items-stretch rounded-lg">
          <span className="flex items-center justify-center rounded-l-lg border border-r-0 border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark pl-4 text-subtle-light dark:text-subtle-dark">
            <Mail size={22} />
          </span>
          <Input
            className="rounded-r-lg border-l-0"
            type="text"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />
        </div>
      </label>

      {mode === "register" && (
        <label className="flex flex-col">
          <p className="pb-2 text-sm font-medium">Name</p>
          <div className="flex w-full items-stretch rounded-lg">
            <span className="flex items-center justify-center rounded-l-lg border border-r-0 border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark pl-4 text-subtle-light dark:text-subtle-dark">
              <PersonStanding size={22} />
            </span>
            <Input
              className="rounded-r-lg border-l-0"
              type="text"
              minLength={2}
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
        </label>
      )}

      <label className="flex flex-col">
        <p className="pb-2 text-sm font-medium">Password</p>
        <div className="flex w-full items-stretch rounded-lg">
          <span className="flex items-center justify-center rounded-l-lg border border-r-0 border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark pl-4 text-subtle-light dark:text-subtle-dark">
            <Lock size={22} />
          </span>
          <Input
            className="rounded-r-lg border-l-0"
            type="password"
            minLength={6}
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              mode === "login" ? "Enter your password" : "Create a password"
            }
          />
        </div>
      </label>

      {mode === "register" && (
        <div className="flex items-center pt-2">
          <Checkbox
            id="admin-checkbox"
            checked={role === "ADMIN"}
            onCheckedChange={(checked) => setRole(checked ? "ADMIN" : "USER")}
          />
          <label
            className="ml-2 text-sm text-subtle-light dark:text-subtle-dark"
            htmlFor="admin-checkbox"
          >
            Register as Admin (optional)
          </label>
        </div>
      )}

      <div className="pt-4">
        <Button
          className="w-full rounded-full font-bold"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Log In"
            : "Register"}
        </Button>
      </div>
    </form>
  );
}

function AlertBar({ alert }: { alert: AlertState | null }) {
  if (!alert) return null;
  const Icon = alert.type === "success" ? CheckCircle : AlertCircle;
  const color =
    alert.type === "success"
      ? "bg-success/10 text-success"
      : "bg-error/10 text-error";
  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-4 font-medium text-sm mb-6 ${color}`}
    >
      <Icon className="w-5 h-5" />
      <p>{alert.message}</p>
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [alert, setAlert] = useState<AlertState | null>(null);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark pb-3 pt-6">
            API Tester Dashboard
          </h1>
        </div>
        <Card className="mt-8 rounded-xl border border-border-light dark:border-border-dark bg-container-light dark:bg-container-dark p-6 sm:p-8 shadow-sm">
          <AlertBar alert={alert} />
          <AuthHeader
            mode={mode}
            setMode={(value) => {
              setMode(value);
              setAlert(null);
            }}
          />
          <AuthForm mode={mode} onAlert={setAlert} />
        </Card>
      </div>
    </div>
  );
}
