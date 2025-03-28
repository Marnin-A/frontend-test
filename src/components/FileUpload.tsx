"use client";
import { useCanvas } from "@/store/CanvasStore";
import React from "react";
import * as fabric from "fabric";
import { Document, Page, pdfjs } from "react-pdf";
import { ClimbingBoxLoader } from "react-spinners";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { X } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

export default function FileUpload() {
	const canvasValue = useCanvas();
	const [docIsLoading, setDocIsLoading] = React.useState(false);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (files) => {
			setDocIsLoading(true);
			canvasValue.setFile(files[0]);
		},
	});

	function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
		canvasValue.setEdits({});
		canvasValue.setNumPages(numPages);
		canvasValue.setCurrPage(1);
		canvasValue.setCanvas(initCanvas());
		setTimeout(() => setDocIsLoading(false), 2000);
	}

	function changePage(offset: number) {
		const page = canvasValue.currPage;
		canvasValue.edits[page] = canvasValue.canvas!.toObject();
		canvasValue.setEdits(canvasValue.edits);
		canvasValue.setCurrPage(page + offset);
		canvasValue.canvas!.clear();
		if (canvasValue.edits[page + offset]) {
			canvasValue.canvas!.loadFromJSON(
				canvasValue.edits[page + offset] as string
			);
		}
		canvasValue.canvas!.renderAll();
	}

	// fabric js
	const initCanvas = () => {
		return new fabric.Canvas("canvas", {
			isDrawingMode: false,
			height: 842,
			width: 595,
			backgroundColor: "rgba(0,0,0,0)",
		});
	};

	React.useEffect(() => {
		pdfjs.GlobalWorkerOptions.workerSrc = new URL(
			"pdfjs-dist/build/pdf.worker.min.mjs",
			import.meta.url
		).toString();
	}, []);
	return (
		<div className="min-h-screen bg-slate-200">
			{canvasValue.selectedFile ? (
				<div
					className={`w-full py-8 ${
						canvasValue.theme
							? "text-white bg-[rgb(20,20,20)]"
							: "text-black bg-white"
					}`}
				>
					<div
						className="p-2 z-[1200] bg-red-500 shadow-sm rounded-md text-white fixed top-5 right-5 cursor-pointer"
						onClick={() => canvasValue.setFile(null)}
					>
						<X className="text-white text-xl" />
					</div>

					<div
						className={`flex justify-center items-center ${
							canvasValue.theme
								? "text-white bg-[rgb(20,20,20)]"
								: "text-black bg-white"
						}`}
					>
						<div
							id="singlePageExport"
							className={`${
								canvasValue.theme
									? "text-white bg-[rgb(20,20,20)]"
									: "text-black bg-white"
							} flex items-center justify-center`}
						>
							{docIsLoading && (
								<>
									<div className="w-[100%] h-[100%] top-[0] fixed bg-[rgba(50,50,50,0.2)] z-[1001] backdrop-blur-sm"></div>
									<div className="fixed z-[1100] flex w-[100%] h-[100%] top-[0] justify-center items-center">
										<ClimbingBoxLoader color={"#606060"} size={20} />
									</div>
								</>
							)}
							<Document
								file={canvasValue.selectedFile}
								onLoadSuccess={onDocumentLoadSuccess}
								className="flex justify-center"
								// id="doc"
							>
								<div
									className="absolute z-[9] px-4 py-4"
									id="canvasWrapper"
									style={{ visibility: "visible" }}
								>
									<canvas id="canvas" />
								</div>
								<div
									className={`px-4 py-4 ${
										!canvasValue.isExporting && canvasValue.theme
											? "bg-[rgb(25,25,25)] shadow-[0px_0px_16px_rgb(0,0,0)] border-none"
											: "shadow-lg border"
									}`}
								>
									<Page
										pageNumber={canvasValue.currPage}
										// id="docPage"
										width={595}
										height={842}
									/>
								</div>
							</Document>
						</div>
					</div>
					<div className="fixed bottom-2 flex items-center justify-center w-full gap-3 z-50">
						{canvasValue.currPage > 1 && (
							<button
								onClick={() => changePage(-1)}
								className="px-4 py-2 bg-gray-700 rounded-md text-white"
							>
								{"<"}
							</button>
						)}
						<div className="px-4 py-2 bg-gray-700 rounded-md text-white">
							Page {canvasValue.currPage} of {canvasValue.numPages}
						</div>
						{canvasValue.currPage < canvasValue.numPages! && (
							<button
								onClick={() => changePage(1)}
								className="px-4 py-2 bg-gray-700 rounded-md text-white"
							>
								{">"}
							</button>
						)}
					</div>
				</div>
			) : (
				<div
					className="w-full min-h-[100vh] py-8 flex items-center justify-center"
					{...getRootProps()}
				>
					<div className="flex w-[40vw] h-[40vh] justify-center items-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
						<div className="space-y-1 text-center">
							<Image
								src="/Ritease-logo.jpeg"
								alt="Logo"
								width={200}
								height={80}
							/>
							<div
								className={`flex text-md ${
									canvasValue.theme ? "text-gray-400" : "text-gray-600"
								}`}
							>
								<label className="relative cursor-pointer rounded-md bg-transparent font-medium text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
									<span>Upload a file</span>
								</label>
								<input
									type="file"
									className="sr-only"
									accept="application/pdf"
									{...getInputProps()}
								/>
								<p className="pl-1">or drag and drop</p>
							</div>
							<p className="text-sm">PDF</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
