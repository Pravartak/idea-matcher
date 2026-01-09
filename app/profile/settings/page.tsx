"use client";

import Link from "next/link";
import {
	ArrowLeft,
	LogOut,
	Shield,
	Bell,
	Lock,
	Eye,
	Github,
	Linkedin,
	Mail,
	Trash2,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [notificationSettings, setNotificationSettings] = useState({
		emailNotifications: true,
		postComments: true,
		connectionRequests: true,
		hackathonUpdates: true,
		weeklyDigest: false,
	});

	const [privacySettings, setPrivacySettings] = useState({
		profilePublic: true,
		showActivity: true,
		showFollowers: true,
		allowMessages: true,
	});
	const router = useRouter();

	const handleNotificationChange = (key: keyof typeof notificationSettings) => {
		setNotificationSettings((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handlePrivacyChange = (key: keyof typeof privacySettings) => {
		setPrivacySettings((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handleLogout = async () => {
		const auth = getAuth();
		try {
			await signOut(auth);
			router.push("/signup");
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	const handleDeleteAccount = async () => {
		const auth = getAuth();
		const user = auth.currentUser;
		if (user) {
			try {
				await deleteUser(user);
				router.push("/signup");
			} catch (error) {
				console.error("Error deleting account:", error);
			}
		}
		setShowDeleteConfirm(false);
	};

	return (
		<div className="min-h-screen bg-background font-mono">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="flex items-center gap-3 px-3 py-3 sm:px-4">
					<Link
						href="/profile"
						className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent sm:h-9 sm:w-9">
						<ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
					</Link>
					<h1 className="text-sm font-semibold sm:text-base">Settings</h1>
				</div>
			</header>

			{/* Settings Content */}
			<main className="mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-6">
				{/* Account Verification Section */}
				<section className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h2 className="mb-3 flex items-center gap-2 text-xs font-semibold sm:mb-4 sm:text-sm">
						<Shield className="h-4 w-4" />
						Account Verification
					</h2>
					<p className="mb-4 text-xs text-muted-foreground sm:text-sm">
						Verify your account to increase trust and visibility in the
						community.
					</p>
					<div className="space-y-2">
						<div className="flex items-center justify-between rounded-md border border-border bg-background/50 p-3">
							<div className="flex items-center gap-2">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<span className="text-xs sm:text-sm">Email Verification</span>
							</div>
							<span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400">
								Verified
							</span>
						</div>
						<div className="flex items-center justify-between rounded-md border border-border bg-background/50 p-3">
							<div className="flex items-center gap-2">
								<Github className="h-4 w-4 text-muted-foreground" />
								<span className="text-xs sm:text-sm">GitHub Account</span>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="h-7 border-border text-xs sm:h-8 sm:text-sm bg-transparent">
								Verify
							</Button>
						</div>
						<div className="flex items-center justify-between rounded-md border border-border bg-background/50 p-3">
							<div className="flex items-center gap-2">
								<Linkedin className="h-4 w-4 text-muted-foreground" />
								<span className="text-xs sm:text-sm">LinkedIn Account</span>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="h-7 border-border text-xs sm:h-8 sm:text-sm bg-transparent">
								Verify
							</Button>
						</div>
					</div>
				</section>

				{/* Notification Settings */}
				<section className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h2 className="mb-3 flex items-center gap-2 text-xs font-semibold sm:mb-4 sm:text-sm">
						<Bell className="h-4 w-4" />
						Notifications
					</h2>
					<div className="space-y-2">
						{[
							{
								key: "emailNotifications",
								label: "Email Notifications",
								description: "Receive email updates",
							},
							{
								key: "postComments",
								label: "Post Comments",
								description: "Notifications when someone comments",
							},
							{
								key: "connectionRequests",
								label: "Connection Requests",
								description: "When someone wants to connect",
							},
							{
								key: "hackathonUpdates",
								label: "Hackathon Updates",
								description: "Hackathon announcements",
							},
							{
								key: "weeklyDigest",
								label: "Weekly Digest",
								description: "Get a weekly summary",
							},
						].map(({ key, label, description }) => (
							<label
								key={key}
								className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-background/50 p-3 transition-colors hover:bg-background">
								<div>
									<div className="text-xs font-medium sm:text-sm">{label}</div>
									<div className="text-xs text-muted-foreground">
										{description}
									</div>
								</div>
								<input
									type="checkbox"
									checked={notificationSettings[key as keyof typeof notificationSettings]}
									onChange={() => handleNotificationChange(key as keyof typeof notificationSettings)}
									className="h-4 w-4 cursor-pointer"
								/>
							</label>
						))}
					</div>
				</section>

				{/* Privacy Settings */}
				<section className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h2 className="mb-3 flex items-center gap-2 text-xs font-semibold sm:mb-4 sm:text-sm">
						<Eye className="h-4 w-4" />
						Privacy
					</h2>
					<div className="space-y-2">
						{[
							{
								key: "profilePublic",
								label: "Public Profile",
								description: "Anyone can view your profile",
							},
							{
								key: "showActivity",
								label: "Activity Visible",
								description: "Show your activity to others",
							},
							{
								key: "showFollowers",
								label: "Show Followers",
								description: "Display your follower list",
							},
							{
								key: "allowMessages",
								label: "Allow Messages",
								description: "Let others message you directly",
							},
						].map(({ key, label, description }) => (
							<label
								key={key}
								className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-background/50 p-3 transition-colors hover:bg-background">
								<div>
									<div className="text-xs font-medium sm:text-sm">{label}</div>
									<div className="text-xs text-muted-foreground">
										{description}
									</div>
								</div>
								<input
									type="checkbox"
									checked={privacySettings[key as keyof typeof privacySettings]}
									onChange={() => handlePrivacyChange(key as keyof typeof privacySettings)}
									className="h-4 w-4 cursor-pointer"
								/>
							</label>
						))}
					</div>
				</section>

				{/* Security Settings */}
				<section className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<h2 className="mb-3 flex items-center gap-2 text-xs font-semibold sm:mb-4 sm:text-sm">
						<Lock className="h-4 w-4" />
						Security
					</h2>
					<div className="space-y-2">
						<Button
							variant="outline"
							className="w-full justify-start border-border text-xs sm:text-sm bg-transparent">
							<Lock className="mr-2 h-4 w-4" />
							Change Password
						</Button>
						<Button
							variant="outline"
							className="w-full justify-start border-border text-xs sm:text-sm bg-transparent">
							<Shield className="mr-2 h-4 w-4" />
							Two-Factor Authentication
						</Button>
					</div>
				</section>

				{/* Logout Section */}
				<section className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
					<Button
						onClick={handleLogout}
						className="w-full bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 sm:text-sm">
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</section>

				{/* Danger Zone */}
				<section className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 sm:p-4">
					<h2 className="mb-3 flex items-center gap-2 text-xs font-semibold text-red-400 sm:mb-4 sm:text-sm">
						<AlertTriangle className="h-4 w-4" />
						Danger Zone
					</h2>
					<p className="mb-4 text-xs text-red-400/80 sm:text-sm">
						Deleting your account is permanent and cannot be undone. All your
						data, posts, and connections will be lost.
					</p>
					<Button
						onClick={() => setShowDeleteConfirm(true)}
						variant="outline"
						className="w-full border-red-500/50 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300 sm:text-sm">
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Account
					</Button>
				</section>

				{/* Delete Confirmation Modal */}
				{showDeleteConfirm && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
						<div className="rounded-lg border border-border bg-card p-4 sm:max-w-sm">
							<h3 className="mb-2 text-sm font-semibold text-red-400">
								Delete Account?
							</h3>
							<p className="mb-4 text-xs text-muted-foreground sm:text-sm">
								This action cannot be undone. All your data will be permanently
								deleted.
							</p>
							<div className="flex gap-2">
								<Button
									onClick={() => setShowDeleteConfirm(false)}
									variant="outline"
									className="flex-1 border-border text-xs sm:text-sm">
									Cancel
								</Button>
								<Button
									onClick={handleDeleteAccount}
									className="flex-1 bg-red-500 text-xs font-medium text-white hover:bg-red-600 sm:text-sm">
									Delete
								</Button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
