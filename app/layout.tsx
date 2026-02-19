import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { AdSense } from "@/components/AdSense";

const jetBrains = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Idea Matcher",
	description: "Find developers who share your vision.",
	generator: "v0.app",
	verification: {
		google: "iO--58OxcUhnZUjD6ZmprGrU3LO51VWG_wlpHmZWCEQ",
	},
	other: {
		"google-adsense-account": "ca-pub-6553407246371441",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${jetBrains.variable} ${GeistSans.variable} ${GeistMono.variable} dark antialiased`}>
			<body className="font-sans">
				<AdSense pId="ca-pub-6553407246371441" />
				<Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
