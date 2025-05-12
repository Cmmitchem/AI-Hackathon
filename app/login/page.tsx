"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Alert,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AuthPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loginEmail, setLoginEmail] = useState("caroline.mitchem@capco.com");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Check for error in URL
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(`Authentication error: ${errorParam}`);
      }
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccessMessage(null);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(`Attempting to sign in with email: ${loginEmail}`);

      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setError(`Login failed: ${result.error}`);
        setDebugInfo(`Login error: ${JSON.stringify(result)}`);
        setIsLoading(false);
      } else {
        setDebugInfo("Login successful! Redirecting...");
        // Success, will be redirected by the useEffect above
      }
    } catch (err) {
      console.error("Error during sign-in:", err);
      setError(
        `An error occurred during sign-in: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      setDebugInfo(`Exception: ${JSON.stringify(err)}`);
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setDebugInfo(`Attempting to register user: ${registerEmail}`);

    // Validate inputs
    if (!registerName.trim()) {
      setError("Name is required");
      setIsLoading(false);
      return;
    }

    if (!registerEmail.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (registerPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/register", {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });

      if (response.status === 201) {
        setSuccessMessage("Registration successful! You can now log in.");
        setDebugInfo(
          `Registration successful: ${JSON.stringify(response.data)}`
        );
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
        // Switch to login tab after successful registration
        setTabValue(0);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.error || "An error occurred during registration"
      );
      setDebugInfo(
        `Registration error: ${JSON.stringify(
          error.response?.data || error.message
        )}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 2,
        mt: 8, // Add margin top to push the form down a bit from the ILLUMINATI title
      }}
    >
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Login" id="auth-tab-0" />
        <Tab label="Register" id="auth-tab-1" />
      </Tabs>

      {/* Login Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleLoginSubmit}>
          <TextField
            label="Email"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, bgcolor: "#134074" }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Typography variant="body2" align="center" mt={2}>
          Don&apos;t have an account?
          <Button onClick={() => setTabValue(1)} sx={{ textTransform: "none" }}>
            Create Account
          </Button>
        </Typography>

        {/* Debug information - only visible in development */}
        {process.env.NODE_ENV === "development" && debugInfo && (
          <Box mt={3} p={2} bgcolor="rgba(0,0,0,0.05)" borderRadius={1}>
            <Typography variant="caption" sx={{ whiteSpace: "pre-wrap" }}>
              Debug Info: {debugInfo}
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Register Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleRegisterSubmit}>
          <TextField
            label="Full Name"
            type="text"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
          />

          <TextField
            label="Email"
            type="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
            helperText="Password must be at least 8 characters long"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, bgcolor: "#134074" }}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <Typography variant="body2" align="center" mt={2}>
          Already have an account?
          <Button onClick={() => setTabValue(0)} sx={{ textTransform: "none" }}>
            Sign In
          </Button>
        </Typography>

        {/* Debug information - only visible in development */}
        {process.env.NODE_ENV === "development" && debugInfo && (
          <Box mt={3} p={2} bgcolor="rgba(0,0,0,0.05)" borderRadius={1}>
            <Typography variant="caption" sx={{ whiteSpace: "pre-wrap" }}>
              Debug Info: {debugInfo}
            </Typography>
          </Box>
        )}
      </TabPanel>
    </Paper>
  );
}
