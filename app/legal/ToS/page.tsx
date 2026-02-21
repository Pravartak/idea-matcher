"use client"

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TermsPage() {
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
				Terms of Service
			</h1>
			<p className="mb-8 text-muted-foreground">
				Last updated: {date}
			</p>

			<div className="space-y-8 text-foreground">
				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						1. Acceptance of Terms
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						By accessing and using Idea Matcher ("the Service"), you accept and
						agree to be bound by the terms and provision of this agreement. If
						you do not agree to abide by these terms, please do not use this
						Service.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						2. Description of Service
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						Idea Matcher is a platform designed to connect students, developers,
						and indie builders to collaborate on projects. We provide matching
						services based on skills, interests, and project goals. We do not
						guarantee that you will find a collaborator or that any
						collaboration will be successful.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						3. User Accounts
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						To access certain features of the Service, you must register for an
						account. You agree to provide accurate, current, and complete
						information during the registration process and to update such
						information to keep it accurate, current, and complete.
					</p>
					<p className="leading-relaxed text-muted-foreground">
						You are responsible for safeguarding your password. You agree that
						you will not disclose your password to any third party and that you
						will take sole responsibility for any activities or actions under
						your account.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						4. User Content
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						You retain your rights to any content you submit, post or display on
						or through the Service (such as project ideas, profiles, and
						messages). By submitting, posting or displaying content on or
						through the Service, you grant us a worldwide, non-exclusive,
						royalty-free license to use, copy, reproduce, process, adapt,
						modify, publish, transmit, display and distribute such content in
						any and all media or distribution methods for the purpose of
						providing the Service.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						5. Prohibited Uses
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						You agree not to use the Service to:
					</p>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
						<li>
							Violate any local, state, national, or international law or
							regulation.
						</li>
						<li>
							Transmit any material that is abusive, harassing, tortious,
							defamatory, vulgar, pornographic, obscene, libelous, invasive of
							another's privacy, hateful, or racially, ethnically, or otherwise
							objectionable.
						</li>
						<li>
							Harass, abuse, or harm another person or group, including other
							users found through the Service.
						</li>
						<li>
							Impersonate any person or entity, or falsely state or otherwise
							misrepresent your affiliation with a person or entity.
						</li>
						<li>
							Scrape or collect data from the Service without our express
							written consent.
						</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						6. Termination
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						We may terminate or suspend access to our Service immediately,
						without prior notice or liability, for any reason whatsoever,
						including without limitation if you breach the Terms. All provisions
						of the Terms which by their nature should survive termination shall
						survive termination, including, without limitation, ownership
						provisions, warranty disclaimers, indemnity and limitations of
						liability.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						7. Limitation of Liability
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						In no event shall Idea Matcher, nor its directors, employees,
						partners, agents, suppliers, or affiliates, be liable for any
						indirect, incidental, special, consequential or punitive damages,
						including without limitation, loss of profits, data, use, goodwill,
						or other intangible losses, resulting from (i) your access to or use
						of or inability to access or use the Service; (ii) any conduct or
						content of any third party on the Service; (iii) any content
						obtained from the Service; and (iv) unauthorized access, use or
						alteration of your transmissions or content.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						8. Changes
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						We reserve the right, at our sole discretion, to modify or replace
						these Terms at any time. By continuing to access or use our Service
						after those revisions become effective, you agree to be bound by the
						revised terms.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight">
						9. Contact Us
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						If you have any questions about these Terms, please contact us.
					</p>
				</section>
			</div>
		</main>
	);
}