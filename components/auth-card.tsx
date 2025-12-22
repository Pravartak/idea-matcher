"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { fetchSignInMethodsForEmail, createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
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
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.includes("github.com")) {
        alert("This account was created using GitHub. Please sign in with GitHub.");
        return;
      }

      if(!methods.includes("password")) {
        alert("This account does not use email & password login.");
        return;
      }

      if(methods.includes("google.com")) {
        alert("This account was created using Google. Please sign in with Google.");
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("firebaseUid:", userCredential.user.uid);

      router.push("/onboarding/profile"); // Redirect to complete profile after signup
    } catch (error: any) {
      alert(error.message);
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

  async function googleLogin() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
    .then(async (result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
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
      const errorMessage = error.message;
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
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              className="
                bg-background/60
                border border-border
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                transition
                text-base md:text-sm
              "
              aria-label="Email"
              autoComplete="email"
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
                  text-base md:text-sm
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
                text-base md:text-sm
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

          <div className="grid gap-3">
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
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/github.svg" alt="GitHub" className="mr-2 size-4" />
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
              onClick={googleLogin}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="mr-2 size-4" />
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
