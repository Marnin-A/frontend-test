import React from "react";
import { useCanvas } from "@/store/CanvasStore";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import * as fabric from "fabric";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Backdrop } from "@mui/material";
import { SyncLoader } from "react-spinners";
import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface ExportModalProps {
	className: string;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ExportModal(props: ExportModalProps) {
	const canvasValue = useCanvas();
	const [exportCanvas, setExportCanvas] =
		React.useState<fabric.StaticCanvas | null>(null);
	const [numPages, setNumPages] = React.useState<number | null>(null);
	const [currPage, setCurrPage] = React.useState<number>(1);
	const [isExporting, setExporting] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (exportCanvas && canvasValue.edits[currPage]) {
			exportCanvas.loadFromJSON(canvasValue.edits[currPage]);
		}
	}, [canvasValue.edits, currPage, exportCanvas]);

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
		setNumPages(numPages);
		setCurrPage(1);
		setExportCanvas(initCanvas());
	};

	const changePage = (offset: number) => {
		const newPage = currPage + offset;
		setCurrPage(newPage);
		if (exportCanvas) {
			exportCanvas.clear();
			if (canvasValue.edits[newPage]) {
				exportCanvas.loadFromJSON(
					canvasValue.edits[newPage],
					exportCanvas.renderAll.bind(exportCanvas)
				);
			}
		}
	};

	const initCanvas = (): fabric.StaticCanvas =>
		new fabric.StaticCanvas("canvas-export", {
			isDrawingMode: false,
			height: 700,
			width: 555,
			backgroundColor: "rgba(0,0,0,0)",
		});

	const onExport = () => {
		setCurrPage(1);
		setExporting(true);
		const docToExport = document.querySelector("#toExport") as HTMLElement;
		const pdf = new jsPDF("p", "mm", "a4");
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = pdf.internal.pageSize.getHeight();
		let currentPage = 1;

		// Recursive function to capture and add each page
		const capturePage = () => {
			html2canvas(docToExport, {
				scale: window.devicePixelRatio,
				allowTaint: true,
			})
				.then((canvas) => {
					const imgData = canvas.toDataURL("image/png");

					// Use Math.max to cover the entire PDF page (cover strategy)
					const canvasWidth = canvas.width;
					const canvasHeight = canvas.height;
					const scale = Math.max(
						pdfWidth / canvasWidth,
						pdfHeight / canvasHeight
					);
					const imgWidth = canvasWidth * scale;
					const imgHeight = canvasHeight * scale;
					// Calculate margins to center the image, negative margins result in cropping
					const marginX = (pdfWidth - imgWidth) / 2;
					const marginY = (pdfHeight - imgHeight) / 2;

					if (currentPage === 1) {
						pdf.addImage(imgData, "PDF", marginX, marginY, imgWidth, imgHeight);
					} else {
						pdf.addPage();
						pdf.setPage(currentPage);
						pdf.addImage(imgData, "PDF", marginX, marginY, imgWidth, imgHeight);
					}
				})
				.finally(() => {
					currentPage++;
					if (numPages && currentPage <= numPages) {
						changePage(1);
						setTimeout(capturePage, 3000);
					} else {
						pdf.save(`${canvasValue.fileName?.split(".pdf")[0]}_edited.pdf`);
						setExporting(false);
						props.setOpen(false);
					}
				});
		};

		setTimeout(capturePage, 1000);
	};

	React.useEffect(() => {
		pdfjs.GlobalWorkerOptions.workerSrc = new URL(
			"pdfjs-dist/build/pdf.worker.min.mjs",
			import.meta.url
		).toString();
	}, []);

	return (
		<Transition show={props.open} as={React.Fragment}>
			<Dialog as="div" className="relative z-50" onClose={props.setOpen}>
				<TransitionChild
					as={React.Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
				</TransitionChild>

				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex max-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 w-full">
						<TransitionChild
							as={React.Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<DialogPanel
								className={`my-6 relative transform overflow-hidden rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transition-all ${
									canvasValue.theme
										? "bg-[rgb(26,26,26)] text-white"
										: "bg-white"
								}`}
							>
								<Backdrop
									sx={{
										color: "#fff",
										zIndex: (theme) => theme.zIndex.drawer + 1,
									}}
									open={isExporting}
								>
									<div className="fixed top-[50%]">
										<SyncLoader color={"#008081"} size={20} />
									</div>
								</Backdrop>
								<div>
									<div className=" mt-3 text-center sm:mt-5">
										<div className="relative mt-2">
											<div>
												{canvasValue.selectedFile ? (
													<div className="w-full py-4">
														<div
															ref={
																canvasValue.exportPage as unknown as React.RefObject<HTMLDivElement>
															}
															id="toExport"
															style={{
																opacity:
																	currPage <= (numPages || 0) ? "1" : "0",
															}}
														>
															<Document
																file={canvasValue.selectedFile}
																onLoadSuccess={onDocumentLoadSuccess}
																className="flex justify-center"
															>
																<div className="absolute z-[9]">
																	<canvas id="canvas-export" />
																</div>
																<Page
																	pageNumber={currPage}
																	className={`px-4 py-2 ${
																		!isExporting && "shadow-lg border"
																	} ${
																		canvasValue.theme &&
																		"border-[rgba(36,36,36,0)]"
																	}`}
																	width={555}
																	height={700}
																/>
															</Document>
														</div>
														<div
															className="fixed top-1 flex justify-center w-11/12 gap-3 mt-3 opacity-70"
															style={{
																opacity:
																	currPage <= (numPages || 0) ? "1" : "0",
															}}
														>
															<div className="flex items-center gap-4 justify-center self-center">
																{currPage > 1 && (
																	<button
																		onClick={() => changePage(-1)}
																		className="px-2 py-1 text-sm bg-gray-700 rounded-md text-white"
																	>
																		<ChevronLeft />
																	</button>
																)}
																<div className="px-4 py-1.5 text-sm bg-gray-700 rounded-md text-white">
																	Page {currPage} of {numPages}
																</div>
																{numPages && currPage < numPages && (
																	<button
																		onClick={() => changePage(1)}
																		className="px-2 py-1 text-sm bg-gray-700 rounded-md text-white"
																	>
																		<ChevronRight />
																	</button>
																)}
															</div>
														</div>
													</div>
												) : null}
											</div>
										</div>
									</div>
									<Button
										variant="ghost"
										onClick={onExport}
										className="aspect-square rounded-2xl mx-auto flex items-center justify-center text-white bg-green-300 dark:bg-neutral-500"
									>
										{isExporting ? (
											<span>Exporting...</span>
										) : (
											<React.Fragment>
												Export
												<Download className="h-10 w-10 text-white dark:text-neutral-300" />
											</React.Fragment>
										)}
									</Button>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
