"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { GithubAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Mode = "login" | "signup"

export function AuthCard({ initialMode = "login" } : { initialMode?: Mode }) {
  const [mode, setMode] = React.useState<Mode>(initialMode)
  const isLogin = mode === "login"
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [userId, setUserId] = React.useState("")

  async function handleSignup() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirect to complete profile after signup
      router.push("/onboarding/profile");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home"); // Redirect to a dashboard or home page after login
    } catch (error: any) {
      alert(error.message);
    }
  }

  // async function githubSignup() {
  //   const auth = getAuth();
  //   const provider = new GithubAuthProvider();
  //   signInWithPopup(auth, provider)
  //   .then((result) => {
  //     // const credential = GithubAuthProvider.credentialFromResult(result);
  //     const userName = result.user.displayName;
  //     const userID = result.user.uid;
  //     localStorage.setItem("user", JSON.stringify(userID));
  //     router.push("/onboarding/profile"); // Redirect to profile completion after signup
  //   })
  //   .catch((error) => {
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     const email = error.customData.email;
  //     const credential = GithubAuthProvider.credentialFromError(error);
  //     alert(errorMessage);
  //   })
  // }

  async function githubLogin() {
    const auth = getAuth();
    const provider = new GithubAuthProvider();
    signInWithPopup(auth, provider)
    .then(async (result) => {
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const firebaseUid = result.user.uid;
      
      const userRef = collection(db, "users");
      const q = query(userRef, where("firebaseUid", "==", firebaseUid));
      const snapshot =  await getDocs(q);

      if(snapshot.empty) {
        // New user, redirect to profile completion
        router.push("/onboarding/profile");
        localStorage.setItem("user", JSON.stringify(result.user));
      } else {
        router.push("/home"); // Redirect to a dashboard or home page after login
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GithubAuthProvider.credentialFromError(error);
      alert(errorMessage);
    })
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-6 text-center">
        <h1 className="text-balance font-mono text-2xl font-semibold tracking-tight">Welcome to Idea Matcher</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connect with builders who share your vision</p>
      </div>

      <Card
        className="
          bg-card/90
          border border-border
          shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.45)]
          backdrop-blur
          transition
          hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.55)]
        "
      >
        <CardHeader className="pb-2">
          <CardTitle className="sr-only">{isLogin ? "Log in" : "Sign up"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm">
              {isLogin ? "Email or User ID" : "Email"}
            </Label>
            <Input
              id="email"
              type={isLogin ? "text" : "email"}
              inputMode={isLogin ? "text" : "email"}
              placeholder={isLogin ? "you@example.com or your-id" : "you@example.com"}
              className="
                bg-background/60
                border border-border
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                transition
              "
              aria-label={isLogin ? "Email or User ID" : "Email"}
              autoComplete={isLogin ? "username" : "email"}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="grid gap-2">
              <Label htmlFor="userId" className="text-sm">
                User ID
              </Label>
              <Input
                id="userId"
                type="text"
                placeholder="your-unique-id"
                className="
                  bg-background/60
                  border border-border
                  focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  transition
                "
                aria-label="User ID"
                autoComplete="username"
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <a
                href="#"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="
                bg-background/60
                border border-border
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                transition
              "
              aria-label="Password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="button"
            onClick={isLogin ? handleLogin : handleSignup}
            className="
              w-full
              font-semibold
              rounded-md
              shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_rgba(99,102,241,0.35)]
              hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(99,102,241,0.45)]
              transition
            "
            size="lg"
          >
            {isLogin ? "Log in" : "Create Account"}
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div className={isLogin ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
            <Button
              variant="outline"
              className="
                w-full
                bg-background/60
                border border-border
                hover:bg-background
                hover:border-primary/40
                hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_rgba(99,102,241,0.25)]
                transition
              "
              onClick={githubLogin}
            >
              <GitHubIcon className="mr-2 size-4" />
              <span className="truncate">Sign in with GitHub</span>
            </Button>
            <Button
              variant="secondary"
              className="
                w-full
                bg-white text-black
                hover:bg-white/90
                hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]
                transition
              "
            >
              <GoogleIcon className="mr-2 size-4" />
              <span className="truncate">Sign in with Google</span>
            </Button>
          </div>

          <p className="pt-1 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground">
              Terms of Service
            </a>{" "}
            &{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {isLogin ? (
          <span>
            Don't have an account?{" "}
            <button
              onClick={() => setMode("signup")}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </button>
          </span>
        ) : (
          <span>
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Log in
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      role="img"
      aria-label="GitHub"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.35-1.76-1.35-1.76-1.1-.76.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.79.42-1.32.76-1.62-2.66-.3-5.46-1.33-5.46-5.92 0-1.31.47-2.37 1.24-3.2-.13-.31-.54-1.55.12-3.24 0 0 1.01-.32 3.3 1.22.96-.27 1.98-.4 3-.41 1.02 0 2.04.14 3 .41 2.28-1.54 3.29-1.22 3.29-1.22.67 1.69.26 2.93.13 3.2 2.28.91 3.83 2.73 3.83 5.01 0 3.31-2.64 6.43-5.98 6.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} role="img" aria-label="Google" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.65 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C34.384 6.42 29.428 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.292 16.116 18.839 12 24 12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.045C9.492 39.797 16.227 44 24 44Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.151 35.959 26.715 37 24 37c-5.202 0-9.62-3.317-11.287-7.946l-6.547 5.045C9.492 39.797 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H24v8h11.303A11.98 11.98 0 0 1 31.218 33.445l6.191 5.238C39.541 36.371 44 31.1 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  )
}
