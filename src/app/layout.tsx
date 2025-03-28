import type { Metadata } from "next";
import "./globals.css";

import localFont from "next/font/local";

export const aspekta = localFont({
	src: [
		{
			path: "./fonts/Aspekta/Aspekta-100.ttf",
			weight: "100",
			style: "normal",
		},
		{
			path: "./fonts/Aspekta/Aspekta-200.ttf",
			weight: "200",
			style: "normal",
		},
		{
			path: "./fonts/Aspekta/Aspekta-300.ttf",
			weight: "300",
			style: "normal",
		},
		{
			path: "./fonts/Aspekta/Aspekta-400.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/Aspekta/Aspekta-500.ttf",
			weight: "500",
			style: "normal",
		},
		{
			path: "./fonts/Aspekta/Aspekta-600.ttf",
			weight: "600",
			style: "normal",
		},
		{
			path: "./fonts/Aspekta/Aspekta-700.ttf",
			weight: "700",
			style: "normal",
		},
		{
			path: "./fonts/Aspekta/Aspekta-800.ttf",
			weight: "800",
			style: "normal",
		},
		{
			path: "./fonts/Aspekta/Aspekta-900.ttf",
			weight: "900",
			style: "normal",
		},
	],
	variable: "--font-aspekta",
});

// export const metadata: Metadata = {
// 	title: "Create Next App",
// 	description: "Generated by create next app",
// };

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
