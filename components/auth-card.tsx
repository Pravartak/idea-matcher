"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	fetchSignInMethodsForEmail,
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithPopup,
} from "firebase/auth";
import { GithubAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Mode = "login" | "signup";

export function AuthCard({ initialMode = "login" }: { initialMode?: Mode }) {
	const [mode, setMode] = React.useState<Mode>(initialMode);
	const isLogin = mode === "login";
	const router = useRouter();
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [userId, setUserId] = React.useState("");
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	async function resolveEmailFromIdentifier(identifier: string) {
		const value = identifier.trim();
		if (!value) return "";
		if (value.includes("@")) return value;

		const usernameSnap = await getDoc(doc(db, "usernames", value));
		if (!usernameSnap.exists()) {
			throw new Error("Username not found.");
		}

		const firebaseUid = usernameSnap.data()?.firebaseUid;
		if (!firebaseUid) {
			throw new Error("Username is not linked to a valid account.");
		}

		const userSnap = await getDoc(doc(db, "users", firebaseUid));
		if (!userSnap.exists() || !userSnap.data()?.Email) {
			throw new Error("No email is linked to this username.");
		}

		return String(userSnap.data().Email);
	}

	async function handleSignup() {
		try {
			setIsSubmitting(true);
			const signupEmail = email.trim();
			const signupPassword = password.trim();
			const signupUserId = userId.trim();

			if (!signupEmail || !signupPassword || !signupUserId) {
				alert("Email, password, and user ID are required.");
				return;
			}
			if (signupPassword.length < 6) {
				alert("Password must be at least 6 characters.");
				return;
			}
			if (!/^[a-zA-Z0-9_]{3,20}$/.test(signupUserId)) {
				alert(
					"User ID must be 3-20 characters and use letters, numbers, or underscores.",
				);
				return;
			}

			const usernameRef = doc(db, "usernames", signupUserId);
			const usernameSnap = await getDoc(usernameRef);
			if (usernameSnap.exists()) {
				alert("User ID is already taken. Please choose another one.");
				return;
			}

			const methods = await fetchSignInMethodsForEmail(auth, signupEmail);

			if (methods.length > 0) {
				if (methods.includes("google.com")) {
					alert(
						"This account already exists with Google. Please sign in with Google.",
					);
					return;
				}
				if (methods.includes("github.com")) {
					alert(
						"This account already exists with GitHub. Please sign in with GitHub.",
					);
					return;
				}
				if (methods.includes("password")) {
					alert("This email is already registered. Please log in.");
					return;
				}
				alert("This email is already linked to another sign-in method.");
				return;
			}
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				signupEmail,
				signupPassword,
			);
			console.log("firebaseUid:", userCredential.user.uid);
			localStorage.setItem("pendingUsername", signupUserId);

			router.push("/onboarding/profile"); // Redirect to complete profile after signup
		} catch (error: any) {
			alert(error.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleLogin() {
		try {
			setIsSubmitting(true);
			const loginIdentifier = email.trim();
			const loginPassword = password.trim();

			if (!loginIdentifier || !loginPassword) {
				alert("Please enter your email/username and password.");
				return;
			}

			const loginEmail = await resolveEmailFromIdentifier(loginIdentifier);
			const methods = await fetchSignInMethodsForEmail(auth, loginEmail);
			if (!methods.includes("password")) {
				if (methods.includes("google.com")) {
					alert("This account uses Google sign-in. Please continue with Google.");
					return;
				}
				if (methods.includes("github.com")) {
					alert("This account uses GitHub sign-in. Please continue with GitHub.");
					return;
				}
				alert("This account does not support email/password login.");
				return;
			}
			const credential = await signInWithEmailAndPassword(
				auth,
				loginEmail,
				loginPassword,
			);

			const profileSnap = await getDoc(doc(db, "users", credential.user.uid));
			if (!profileSnap.exists()) {
				router.push("/onboarding/profile");
				return;
			}
			router.push("/home"); // Redirect to a dashboard or home page after login
		} catch (error: any) {
			alert(error.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function githubLogin() {
		setIsSubmitting(true);
		const provider = new GithubAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			const firebaseUid = result.user.uid;

			const docRef = doc(db, "users", firebaseUid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				// New user, redirect to profile completion
				router.push("/onboarding/profile");
				localStorage.setItem("user", JSON.stringify(result.user));
			} else {
				router.push("/home"); // Redirect to a dashboard or home page after login
			}
		} catch (error: any) {
			alert(error.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function googleLogin() {
		setIsSubmitting(true);
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			const firebaseUid = result.user.uid;

			const docRef = doc(db, "users", firebaseUid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				// New user, redirect to profile completion
				router.push("/onboarding/profile");
				localStorage.setItem("user", JSON.stringify(result.user));
			} else {
				router.push("/home"); // Redirect to a dashboard or home page after login
			}
		} catch (error: any) {
			alert(error.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleForgotPassword() {
		try {
			setIsSubmitting(true);
			if (!email.trim()) {
				alert("Enter your email or username first.");
				return;
			}
			const resolvedEmail = await resolveEmailFromIdentifier(email.trim());
			const methods = await fetchSignInMethodsForEmail(auth, resolvedEmail);
			if (!methods.includes("password")) {
				if (methods.includes("google.com")) {
					alert("This account uses Google sign-in. Use Google login instead of password reset.");
					return;
				}
				if (methods.includes("github.com")) {
					alert("This account uses GitHub sign-in. Use GitHub login instead of password reset.");
					return;
				}
				alert("Password reset is not available for this account.");
				return;
			}
			await sendPasswordResetEmail(auth, resolvedEmail);
			alert("Password reset email sent.");
		} catch (error: any) {
			alert(error.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="w-full max-w-[420px]">
			<div className="mb-6 text-center">
				<h1 className="text-balance font-mono text-2xl font-semibold tracking-tight">
					Welcome to Idea Matcher
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Connect with builders who share your vision
				</p>
			</div>

			<Card
				className="
          bg-card/90
          border border-border
          shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.45)]
          backdrop-blur
          transition
          hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.55)]
        ">
				<CardHeader className="pb-2">
					<CardTitle className="sr-only">
						{isLogin ? "Log in" : "Sign up"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="email" className="text-sm">
							{isLogin ? "Email or User ID" : "Email"}
						</Label>
						<Input
							id="email"
							type="text"
							inputMode={isLogin ? "text" : "email"}
							placeholder={
								isLogin ? "you@example.com or username" : "you@example.com"
							}
							className="
                bg-background/60
                border border-border
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                transition
                text-base md:text-sm
              "
							aria-label="Email"
							autoComplete={isLogin ? "username" : "email"}
							value={email}
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
								value={userId}
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
								onClick={(e) => {
									e.preventDefault();
									handleForgotPassword();
								}}
								className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
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
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<Button
						type="button"
						onClick={isLogin ? handleLogin : handleSignup}
						disabled={isSubmitting}
						className="
              w-full
              font-semibold
              rounded-md
              shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_rgba(99,102,241,0.35)]
              hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(99,102,241,0.45)]
              transition
            "
						size="lg">
						{isSubmitting
							? "Please wait..."
							: isLogin
								? "Log in"
								: "Create Account"}
					</Button>

					<div className="relative my-2">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="bg-card px-2 text-muted-foreground">
								or continue with
							</span>
						</div>
					</div>

					<div className="grid gap-3">
						<Button
							variant="outline"
							disabled={isSubmitting}
							className="
                w-full
                bg-background/60
                border border-border
                hover:bg-background
                hover:border-primary/40
                hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_rgba(99,102,241,0.25)]
                transition
              "
							onClick={githubLogin}>
							<img
								src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/github.svg"
								alt="GitHub"
								className="mr-2 size-4"
							/>
							<span className="truncate">Sign in with GitHub</span>
						</Button>
						<Button
							variant="secondary"
							disabled={isSubmitting}
							className="
                w-full
                bg-white text-black
                hover:bg-white/90
                hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]
                transition
              "
							onClick={googleLogin}>
							<img
								src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
								alt="Google"
								className="mr-2 size-4"
							/>
							<span className="truncate">Sign in with Google</span>
						</Button>
					</div>

					<p className="pt-1 text-center text-xs text-muted-foreground">
						By continuing, you agree to our{" "}
						<Link
							href="/legal/ToS"
							className="underline underline-offset-4 hover:text-foreground">
							Terms of Service
						</Link>{" "}
						&{" "}
						<Link
							href="/legal/Privacy-Policy"
							className="underline underline-offset-4 hover:text-foreground">
							Privacy Policy
						</Link>
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
							className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
							Sign up
						</button>
					</span>
				) : (
					<span>
						Already have an account?{" "}
						<button
							onClick={() => setMode("login")}
							className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
							Log in
						</button>
					</span>
				)}
			</div>
		</div>
	);
}
