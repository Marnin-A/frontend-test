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
	addImage: (
		e: React.ChangeEvent<HTMLInputElement>,
		canvi: fabric.Canvas
	) => void;
	addNote: (canvi: fabric.Canvas) => void;
	deleteBtn: () => void;
	addRect: (canvi: fabric.Canvas) => void;
	addCircle: (canvi: fabric.Canvas) => void;
	addHighlight: (canvi: fabric.Canvas) => void;
	addText: (canvi: fabric.Canvas) => void;
	toggleDraw: (canvi: fabric.Canvas) => void;
	exportPdf: () => void;
}

export const useCanvas = create<CanvasStore>((set, get) => ({
	// State
	theme: false,
	numPages: null,
	currPage: 1,
	selectedFile: null,
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

	// When changing color, update active fabric object (if exists)
	setColor: (newColor: string) => {
		set({ color: newColor });
		const { canvas } = get();
		if (canvas && canvas.getActiveObject()) {
			const activeObject = canvas.getActiveObject();
			activeObject?.set("fill", newColor);
			canvas.renderAll();
		}
	},

	// When changing borderColor, update drawing brush and active object
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

	// Update strokeWidth for both drawing mode and active object
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

	addImage: (e: React.ChangeEvent<HTMLInputElement>, canvi: fabric.Canvas) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = function (f: ProgressEvent<FileReader>) {
			const data = f.target?.result as string;
			fabric.FabricImage.fromURL(data, {}, function (img: fabric.Image) {
				img.scaleToWidth(300);
				canvi.add(img);
				canvi.renderAll();
				// Optionally get the data URL
				canvi.toDataURL({
					format: "png",
					quality: 0.8,
					multiplier: 1,
				});
			});
		};
		reader.readAsDataURL(file);
		canvi.isDrawingMode = false;
	},

	addNote: (canvi: fabric.Canvas) => {
		const noteNumber = (Math.floor(Math.random() * 10) % 4) + 1;
		fabric.FabricImage.fromURL(
			`./note/note${noteNumber}.png`,
			{},
			function (img: fabric.Image) {
				img.scaleToWidth(100);
				canvi.add(img);
				canvi.renderAll();
				canvi.toDataURL({
					format: "png",
					quality: 0.8,
					multiplier: 1,
				});
			}
		);
		canvi.isDrawingMode = false;
	},

	deleteBtn: () => {
		const { canvas } = get();
		if (canvas && canvas.getActiveObject()) {
			canvas.remove(canvas.getActiveObject()!);
		}
	},

	addRect: (canvi: fabric.Canvas) => {
		const { color, borderColor, strokeWidth } = get();
		const rect = new fabric.Rect({
			height: 180,
			width: 200,
			fill: color,
			stroke: borderColor,
			strokeWidth: strokeWidth,
			cornerStyle: "circle",
			editable: true,
		});
		canvi.add(rect);
		canvi.renderAll();
		canvi.isDrawingMode = false;
	},

	addCircle: (canvi: fabric.Canvas) => {
		const { color, borderColor } = get();
		const circle = new fabric.Circle({
			radius: 100,
			fill: color,
			cornerStyle: "circle",
			editable: true,
			stroke: borderColor,
			strokeWidth: 2,
		});
		canvi.add(circle);
		canvi.renderAll();
		canvi.isDrawingMode = false;
	},

	addHighlight: (canvi: fabric.Canvas) => {
		const { color } = get();
		const highlight = new fabric.Rect({
			height: 20,
			width: 400,
			fill: color + "33",
			cornerStyle: "circle",
			editable: true,
		});
		canvi.add(highlight);
		canvi.renderAll();
		canvi.isDrawingMode = false;
	},

	addText: (canvi: fabric.Canvas) => {
		const { color } = get();
		const text = new fabric.Textbox("Type Here ...", { editable: true });
		text.set({ fill: color, fontFamily: aspekta.style.fontFamily });
		canvi.add(text);
		canvi.renderAll();
		canvi.isDrawingMode = false;
	},

	toggleDraw: (canvi: fabric.Canvas) => {
		const { borderColor, strokeWidth, canvas } = get();
		canvi.isDrawingMode = !canvi.isDrawingMode;
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
}));
