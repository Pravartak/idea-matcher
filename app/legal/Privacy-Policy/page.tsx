"use client"

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PrivacyPage() {
	const [date, setDate] = useState("");

	useEffect(() => {
		setDate(new Date().toLocaleDateString());
	}, []);

	return (
		<main className="mx-auto max-w-4xl px-6 py-12 md:py-20">
			<div className="mb-8">
				<Link
					href="/signup"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors">
					&larr; Back to Login
				</Link>
			</div>

			<h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
				Privacy Policy
			</h1>
			<p className="mb-8 text-muted-foreground">
				Last updated: {date}
			</p>

			<div className="space-y-8 text-foreground">
				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						1. Introduction
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						Idea Matcher ("we," "our," or "us") is committed to protecting your
						privacy. This Privacy Policy explains how we collect, use, disclose,
						and safeguard your information when you use our platform. By accessing
						or using the Service, you agree to the terms of this Privacy Policy.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						2. Information We Collect
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						We collect information that you provide directly to us when you
						register for an account, create a profile, or communicate with us.
						This may include:
					</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
						<li>
							<strong>Personal Information:</strong> Name, email address, and
							other contact details.
						</li>
						<li>
							<strong>Profile Information:</strong> Skills, interests, project
							ideas, and other information you choose to display on your profile.
						</li>
						<li>
							<strong>Usage Data:</strong> Information about how you interact with
							our Service, such as the pages you visit and the actions you take.
						</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						3. How We Use Your Information
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						We use the information we collect to:
					</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
						<li>Provide, maintain, and improve our Service.</li>
						<li>
							Match you with potential collaborators based on your skills and
							interests.
						</li>
						<li>
							Communicate with you about updates, security alerts, and support
							messages.
						</li>
						<li>Monitor and analyze trends, usage, and activities.</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						4. Sharing of Information
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						We do not sell your personal information. We may share your
						information in the following circumstances:
					</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
						<li>
							<strong>With other users:</strong> Your profile information is
							visible to other users to facilitate collaboration.
						</li>
						<li>
							<strong>Service Providers:</strong> We may share information with
							third-party vendors who perform services on our behalf.
						</li>
						<li>
							<strong>Legal Requirements:</strong> We may disclose information if
							required to do so by law or in response to valid requests by
							public authorities.
						</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						5. Data Security
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						We take reasonable measures to help protect information about you from
						loss, theft, misuse, and unauthorized access, disclosure, alteration,
						and destruction. However, no internet transmission is completely
						secure, and we cannot guarantee the security of your data.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						6. Your Rights
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						You have the right to access, correct, or delete your personal
						information. You can manage your profile information through your
						account settings. If you wish to delete your account, please contact
						us.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						7. Changes to This Policy
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						We may update this Privacy Policy from time to time. If we make
						changes, we will notify you by revising the date at the top of the
						policy and, in some cases, we may provide you with additional notice.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						8. Contact Us
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						If you have any questions about this Privacy Policy, please contact
						us.
					</p>
				</section>
			</div>
		</main>
	);
}