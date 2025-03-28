import { create } from "zustand";
import * as fabric from "fabric";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { aspekta } from "@/app/layout";

interface CanvasStore {
	// State
	theme: boolean;
	numPages: number | null;
	currPage: number;
	selectedFile: File | null;
	undoStack: fabric.Object[];
	redoStack: fabric.Object[];
	color: string;
	borderColor: string;
	strokeWidth: number;
	canvas: fabric.Canvas | null;
	isExporting: boolean;
	hideCanvas: boolean;
	exportPages: HTMLElement[];
	edits: Record<string, unknown>;
	exportPage: HTMLElement | null;

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

	// Methods to update canvas properties
	setColor: (newColor: string) => void;
	setBorderColor: (newColor: string) => void;
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
}

export const useCanvas = create<CanvasStore>((set, get) => ({
	// State
	theme: false,
	numPages: null,
	currPage: 1,
	selectedFile: null,
	undoStack: [],
	redoStack: [],
	color: "#000",
	borderColor: "#f4a261",
	strokeWidth: 1,
	canvas: null,
	isExporting: false,
	hideCanvas: false,
	exportPages: [],
	edits: {},
	exportPage: null,

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

	setBorderColor: (newColor: string) => {
		set({ borderColor: newColor });
		const { canvas } = get();
		if (canvas && canvas.isDrawingMode && canvas.freeDrawingBrush) {
			canvas.freeDrawingBrush.color = newColor;
		}
		if (canvas && canvas.getActiveObject()) {
			const activeObject = canvas.getActiveObject();
			activeObject?.set("stroke", newColor);
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
		// Enable drawing mode
		canvasObj.isDrawingMode = true;

		// Create a new PencilBrush for highlighting
		const highlight = new fabric.PencilBrush(canvasObj);
		highlight.width = 10;
		highlight.color = "rgba(244, 162, 97, 0.5)"; // Semi-transparent for highlight effect
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
		const { color, strokeWidth } = get();
		let isDrawing = false;
		let underline: fabric.Line;

		// When the user presses the mouse button down, begin drawing
		const handleMouseDown = (
			opt: fabric.TPointerEventInfo<fabric.TPointerEvent>
		) => {
			isDrawing = true;
			const pointer = canvasObj.getViewportPoint(opt.e);
			// Create a line with the start and end at the pointer position
			underline = new fabric.Line(
				[pointer.x, pointer.y, pointer.x, pointer.y],
				{
					stroke: color,
					strokeWidth: strokeWidth,
					selectable: false,
					evented: false,
				}
			);
			canvasObj.add(underline);
		};

		// As the mouse moves, update the end coordinates of the line
		const handleMouseMove = (
			opt: fabric.TPointerEventInfo<fabric.TPointerEvent>
		) => {
			if (!isDrawing) return;
			const pointer = canvasObj.getViewportPoint(opt.e);
			// Update the x2 coordinate so the line extends horizontally.
			// Optionally, you could lock the y coordinate if you want a strict underline effect.
			underline.set({ x2: pointer.x, y2: pointer.y });
			canvasObj.renderAll();
		};

		// When the user releases the mouse, finish the drawing
		const handleMouseUp = () => {
			if (isDrawing) {
				isDrawing = false;
				// Save the underline to the undo stack
				set((state) => ({ undoStack: [...state.undoStack, underline] }));
				// Remove event listeners after drawing is finished
				canvasObj.off("mouse:down", handleMouseDown);
				canvasObj.off("mouse:move", handleMouseMove);
				canvasObj.off("mouse:up", handleMouseUp);
			}
		};

		// Attach the events
		canvasObj.on("mouse:down", handleMouseDown);
		canvasObj.on("mouse:move", handleMouseMove);
		canvasObj.on("mouse:up", handleMouseUp);
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
			brush.color = borderColor;
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
}));
