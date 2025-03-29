import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as fabric from "fabric";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { aspekta } from "@/app/layout";

interface RGBA {
	r: number;
	g: number;
	b: number;
	a?: number;
}

interface CanvasStore {
	// State
	theme: boolean;
	numPages: number | null;
	currPage: number;
	selectedFile: File | null;
	undoStack: fabric.Object[];
	redoStack: fabric.Object[];
	color: string;
	borderColor: string | RGBA;
	strokeWidth: number;
	canvas: fabric.Canvas | null;
	isExporting: boolean;
	hideCanvas: boolean;
	exportPages: HTMLElement[];
	edits: Record<string, unknown>;
	exportPage: HTMLElement | null;
	activeFilter: string | null;
	fileName: string | null;

	// Setters
	setEdits: (edits: Record<string, unknown>) => void;
	setTheme: (value: boolean) => void;
	setNumPages: (value: number | null) => void;
	setCurrPage: (value: number) => void;
	setFile: (file: File | null) => void;
	setCanvas: (canvasInstance: fabric.Canvas | null) => void;
	setExporting: (value: boolean) => void;
	setHiddenCanvas: (value: boolean) => void;
	setExportPages: (pages: HTMLElement[]) => void;
	setFileName: (name: string | null) => void;

	// Methods to update canvas properties
	setColor: (newColor: string) => void;
	setBorderColor: (newColor: string | RGBA) => void;
	setStrokeWidth: (newWidth: number) => void;

	// Other methods
	downloadPage: () => Promise<void>;
	addNote: (canvasObj: fabric.Canvas) => void;
	deleteBtn: () => void;
	addHighlight: (canvasObj: fabric.Canvas) => void;
	drawUnderline: (canvasObj: fabric.Canvas) => void;
	undoAction: () => void;
	redoAction: () => void;
	addText: (canvasObj: fabric.Canvas) => void;
	toggleDraw: (canvasObj: fabric.Canvas) => void;
	exportPdf: () => void;
	setActiveFilters: (filter: string | null) => void;
	setTextColour: (newColor: string) => void;
	clearAll: () => void;
	selectPointer: (canvasObj: fabric.Canvas) => void;
}

export const useCanvas = create<CanvasStore>()(
	persist(
		(set, get) => ({
			// State
			theme: false,
			numPages: null,
			currPage: 1,
			selectedFile: null,
			undoStack: [],
			redoStack: [],
			color: "#000",
			borderColor: "#ffeb3b",
			strokeWidth: 1,
			canvas: null,
			isExporting: false,
			hideCanvas: false,
			exportPages: [],
			edits: {},
			exportPage: null,
			activeFilter: null,
			fileName: null,

			// Setters
			setEdits: (edits: Record<string, unknown>) => set({ edits }),
			setTheme: (value: boolean) => set({ theme: value }),
			setNumPages: (value: number | null) => set({ numPages: value }),
			setCurrPage: (value: number) => set({ currPage: value }),
			setFile: (file: File | null) => set({ selectedFile: file }),
			setCanvas: (canvasInstance: fabric.Canvas | null) =>
				set({ canvas: canvasInstance }),
			setExporting: (value: boolean) => set({ isExporting: value }),
			setHiddenCanvas: (value: boolean) => set({ hideCanvas: value }),
			setExportPages: (pages: HTMLElement[]) => set({ exportPages: pages }),
			setActiveFilters: (filter: string | null) =>
				set({ activeFilter: filter }),
			setFileName: (name: string | null) => set({ fileName: name }),

			// Update drawing properties and active object
			setColor: (newColor: string) => {
				set({ color: newColor });
				const { canvas } = get();
				if (canvas && canvas.getActiveObject()) {
					const activeObject = canvas.getActiveObject();

					activeObject?.set("fill", newColor);

					canvas.renderAll();
				}
			},

			setBorderColor: (newColor: string | RGBA) => {
				set({ borderColor: newColor });
				const { canvas, activeFilter } = get();
				if (canvas && canvas.isDrawingMode && canvas.freeDrawingBrush) {
					if (activeFilter === "highlight" || activeFilter === "underline") {
						canvas.freeDrawingBrush.color = `rgba(${(newColor as RGBA).r}, ${
							(newColor as RGBA).g
						}, ${(newColor as RGBA).b}, 0.5)`;
					} else {
						canvas.freeDrawingBrush.color = newColor as string;
					}
				}
				if (canvas && canvas.getActiveObject()) {
					const activeObject = canvas.getActiveObject();
					if (activeFilter === "highlight" || activeFilter === "underline") {
						activeObject?.set(
							"stroke",
							`rgba(${(newColor as RGBA).r}, ${(newColor as RGBA).g}, ${
								(newColor as RGBA).b
							}, 0.5)`
						);
					} else {
						activeObject?.set("stroke", newColor);
					}
					canvas.renderAll();
				}
			},

			setStrokeWidth: (newWidth: number) => {
				set({ strokeWidth: newWidth });
				const { canvas } = get();
				if (canvas && canvas.isDrawingMode && canvas.freeDrawingBrush) {
					canvas.freeDrawingBrush.width = newWidth;
				}
				if (canvas && canvas.getActiveObject()) {
					const activeObject = canvas.getActiveObject();
					activeObject?.set("strokeWidth", newWidth);
					canvas.renderAll();
				}
			},

			// Methods
			downloadPage: async () => {
				set({ isExporting: true });
				const doc = document.querySelector("#singlePageExport");
				if (!doc) return;
				const canvasElement = await html2canvas(doc as HTMLElement);
				const imgData = canvasElement.toDataURL("image/png");
				const pdf = new jsPDF();
				const pdfWidth = pdf.internal.pageSize.getWidth();
				const pdfHeight = pdf.internal.pageSize.getHeight();
				pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
				pdf.save("edge_lamp_edited.pdf");
				set({ isExporting: false });
			},

			addNote: (canvasObj: fabric.Canvas) => {
				const noteNumber = (Math.floor(Math.random() * 10) % 4) + 1;
				fabric.FabricImage.fromURL(
					`./note/note${noteNumber}.png`,
					{},
					function (img: fabric.Image) {
						img.scaleToWidth(100);
						canvasObj.add(img);
						// Push the added note to the undo stack
						set((state) => ({ undoStack: [...state.undoStack, img] }));
						canvasObj.renderAll();
						canvasObj.toDataURL({
							format: "png",
							quality: 0.8,
							multiplier: 1,
						});
					}
				);
				canvasObj.isDrawingMode = false;
			},

			deleteBtn: () => {
				const { canvas } = get();
				if (canvas && canvas.getActiveObject()) {
					// Optionally, you can save the deleted object if you wish to support redo
					canvas.remove(canvas.getActiveObject()!);
					canvas.renderAll();
				}
			},

			addHighlight: (canvasObj: fabric.Canvas) => {
				const { strokeWidth } = get();
				// Enable drawing mode
				canvasObj.isDrawingMode = true;

				// Create a new PencilBrush for highlighting
				const highlight = new fabric.PencilBrush(canvasObj);
				highlight.width = strokeWidth;
				highlight.strokeLineCap = "round";
				highlight.strokeLineJoin = "round";

				// Assign the brush to the canvas
				canvasObj.freeDrawingBrush = highlight;

				// When a new path is created, add it to the undo stack
				canvasObj.on("path:created", (event) => {
					if (event.path) {
						set((state) => ({ undoStack: [...state.undoStack, event.path] }));
					}
				});

				canvasObj.renderAll();
			},

			drawUnderline: (canvasObj: fabric.Canvas) => {
				const { color } = get();
				let isDrawing = false;
				let currentUnderline: fabric.Line | null = null;

				const handleMouseDown = (
					opt: fabric.TPointerEventInfo<fabric.TPointerEvent>
				) => {
					isDrawing = true;
					const pointer = canvasObj.getViewportPoint(opt.e);
					// Create a line with the start and end at the pointer position
					currentUnderline = new fabric.Line(
						[pointer.x, pointer.y, pointer.x, pointer.y],
						{
							stroke: color,
							strokeWidth: 2,
							selectable: false,
							evented: false,
						}
					);
					canvasObj.add(currentUnderline);
				};

				const handleMouseMove = (
					opt: fabric.TPointerEventInfo<fabric.TPointerEvent>
				) => {
					if (!isDrawing) return;
					const pointer = canvasObj.getViewportPoint(opt.e);

					currentUnderline?.set({ x2: pointer.x, y2: pointer.y });
					canvasObj.renderAll();
				};

				const handleMouseUp = () => {
					if (isDrawing) {
						isDrawing = false;
						set((state) => ({
							undoStack: [...state.undoStack, currentUnderline!],
						}));

						// Reset currentUnderline for next draw
						currentUnderline = null;
					}
				};

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if (!(canvasObj as any).__underlineListenersAttached) {
					canvasObj.on("mouse:down", handleMouseDown);
					canvasObj.on("mouse:move", handleMouseMove);
					canvasObj.on("mouse:up", handleMouseUp);
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(canvasObj as any).__underlineListenersAttached = true;
				}
			},

			addText: (canvasObj: fabric.Canvas) => {
				const { color, borderColor } = get();
				const text = new fabric.Textbox("Add a comment", { editable: true });
				text.set({
					fill: color,
					borderTopWidth: 2,
					borderLeftWidth: 2,
					borderRightWidth: 2,
					borderBottomWidth: 2,
					borderTopLeftRadius: 16,
					borderTopRightRadius: 16,
					borderBottomleftRadius: 16,
					borderBottomRightRadius: 16,
					borderColor: borderColor,
					fontSize: 20,
					fontFamily: aspekta.style.fontFamily,
				});
				canvasObj.add(text);
				// Save text addition to the undo stack
				set((state) => ({ undoStack: [...state.undoStack, text] }));
				canvasObj.renderAll();
				canvasObj.isDrawingMode = false;
			},

			toggleDraw: (canvasObj: fabric.Canvas) => {
				const { borderColor, strokeWidth, canvas } = get();
				canvasObj.isDrawingMode = !canvasObj.isDrawingMode;
				if (canvas && canvas.freeDrawingBrush) {
					const brush = canvas.freeDrawingBrush;
					brush.color = borderColor as string;
					brush.width = strokeWidth;
				}
			},

			exportPdf: () => {
				const { exportPages, exportPage } = get();
				// Filter out any null values before setting
				set({
					exportPages: [...exportPages, exportPage].filter(
						(page): page is HTMLElement => page !== null
					),
				});
				console.log([...exportPages, exportPage]);
			},

			// General undo function that removes the last added object from the canvas
			undoAction: () => {
				const { canvas, undoStack } = get();
				if (canvas && undoStack.length > 0) {
					const lastObj = undoStack[undoStack.length - 1];
					canvas.remove(lastObj);
					set({
						undoStack: undoStack.slice(0, -1),
						redoStack: [...get().redoStack, lastObj],
					});
					canvas.renderAll();
				}
			},
			redoAction: () => {
				const { canvas, undoStack, redoStack } = get();
				if (canvas && redoStack.length > 0) {
					const lastObj = redoStack[redoStack.length - 1];
					canvas.add(lastObj);
					set({
						undoStack: [...undoStack, lastObj],
						redoStack: redoStack.slice(0, -1),
					});
					canvas.renderAll();
				}
			},

			setTextColour: (newColor: string) => {
				set({ color: newColor });
				set({ borderColor: newColor });
			},

			clearAll: () => {
				const { canvas } = get();
				if (canvas) {
					canvas.getObjects().forEach((obj) => canvas.remove(obj));
					canvas.renderAll();
				}
			},

			selectPointer: (canvasObj) => {
				if (canvasObj) {
					canvasObj.isDrawingMode = false;
					canvasObj.renderAll();
				}
			},
		}),
		{
			name: "canvas-store",
			partialize: (state) => ({
				theme: state.theme,
				numPages: state.numPages,
				currPage: state.currPage,
				color: state.color,
				borderColor: state.borderColor,
				strokeWidth: state.strokeWidth,
				edits: state.edits,
			}),
		}
	)
);
