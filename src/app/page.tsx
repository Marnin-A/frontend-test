"use client";
import dynamic from "next/dynamic";

export default function Home() {
	const DynamicFileUpload = dynamic(() => import("@/components/FileUpload"), {
		ssr: false,
	});
	return (
		<div className="">
			<DynamicFileUpload />
		</div>
	);
}
