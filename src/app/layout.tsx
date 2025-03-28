import type { Metadata } from "next";
import "./globals.css";

import localFont from "next/font/local";

export const aspekta = localFont({
	// ...existing configuration...
	src: [
		{
			path: "../../fonts/Aspekta/Aspekta-100.woff2",
			weight: "100",
			style: "normal",
		},
		{
			path: "../../fonts/Aspekta/Aspekta-200.woff2",
			weight: "200",
			style: "normal",
		},
		{
			path: "../../fonts/Aspekta/Aspekta-300.woff2",
			weight: "300",
			style: "normal",
		},
		{
			path: "../../fonts/Aspekta/Aspekta-400.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../fonts/Aspekta/Aspekta-500.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../fonts/Aspekta/Aspekta-600.woff2",
			weight: "600",
			style: "normal",
		},
		{
			path: "../../fonts/Aspekta/Aspekta-700.woff2",
			weight: "700",
			style: "normal",
		},
		{
			path: "../../fonts/Aspekta/Aspekta-800.woff2",
			weight: "800",
			style: "normal",
		},
		{
			path: "../../fonts/Aspekta/Aspekta-900.woff2",
			weight: "900",
			style: "normal",
		},
	],
	variable: "--font-aspekta",
});

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${aspekta.variable} ${aspekta.variable} antialiased`}>
				{children}
			</body>
		</html>
	);
}
