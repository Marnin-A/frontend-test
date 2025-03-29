import { useCanvas } from "@/store/CanvasStore";
import {
	Download,
	LucideHighlighter,
	MessageSquareMore,
	MousePointer2,
	Signature,
	Trash,
	Trash2,
	Underline,
	Undo,
} from "lucide-react";
import React from "react";
import * as fabric from "fabric";
import { Button } from "./ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import { Slider } from "./ui/slider";
import { CirclePicker } from "react-color";
import { cn } from "@/lib/utils";
import ExportModal from "./ExportModal";

export default function SideBar() {
	const canvasValue = useCanvas();
	const [openExporter, setOpenExporter] = React.useState(false);

	const data = React.useMemo(
		() => [
			{
				title: "Undo",
				icon: (
					<Undo className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
				),
				onClick: () => canvasValue.undoAction(),
			},
			{
				title: "Redo",
				icon: (
					<Undo className="h-10 w-10 text-neutral-600 dark:text-neutral-300 rotate-180" />
				),
				onClick: () => canvasValue.redoAction(),
			},
			{
				title: "Remove Selected",
				icon: (
					<Trash className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
				),
				onClick: () => canvasValue.deleteBtn(),
			},
			{
				title: "Remove All",
				icon: (
					<Trash2 className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
				),
				onClick: () => canvasValue.clearAll(),
			},
		],
		[canvasValue]
	);

	function handleOpen(title: string) {
		if (canvasValue.activeFilter == title) {
			canvasValue.setActiveFilters(null);
			canvasValue.selectPointer(canvasValue.canvas as fabric.Canvas);
		} else {
			canvasValue.setActiveFilters(title);
			switch (title) {
				case "highlight":
					canvasValue.addHighlight(canvasValue.canvas as fabric.Canvas);
					break;
				case "underline":
					canvasValue.drawUnderline(canvasValue.canvas as fabric.Canvas);
					break;
				case "text":
					canvasValue.addText(canvasValue.canvas as fabric.Canvas);
					break;
				case "signature":
					canvasValue.toggleDraw(canvasValue.canvas as fabric.Canvas);
					break;

				default:
					canvasValue.selectPointer(canvasValue.canvas as fabric.Canvas);
					break;
			}
		}
	}

	return (
		<div className="fixed z-50 top-[20%] left-0 h-max md:mx-16">
			<div className="flex flex-col gap-4">
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								onClick={() => {
									handleOpen("pointer");
								}}
								className="aspect-square rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800"
							>
								<MousePointer2 className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Pointer</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				{/* Highlight */}
				<div className="relative w-max h-max">
					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									onClick={() => {
										handleOpen("highlight");
									}}
									className="aspect-square rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800"
								>
									<LucideHighlighter className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Highlight</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					{canvasValue.activeFilter === "highlight" && (
						<div className="absolute left-16 -top-[200%] min-w-40 min-h-40 pt-4 pb-2 px-4 bg-white border shadow-sm dark:bg-neutral-800 rounded-md">
							<h3 className="mb-3">Stroke Width</h3>
							<Slider
								defaultValue={[canvasValue.strokeWidth]}
								max={100}
								step={1}
								onValueChange={(value) => {
									canvasValue.setStrokeWidth(value[0]);
								}}
							/>
							<h3 className="mt-4 mb-3">Colours</h3>
							<CirclePicker
								color={canvasValue.borderColor}
								onChange={(color) => {
									console.log(color);
									canvasValue.setBorderColor(color.rgb);
								}}
							/>
						</div>
					)}
				</div>

				{/* Underline */}
				<div className="relative w-max h-max">
					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									onClick={() => {
										handleOpen("underline");
									}}
									className="aspect-square rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800"
								>
									<Underline className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Underline</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					{canvasValue.activeFilter === "underline" && (
						<div className="absolute left-16 -top-[200%] min-w-40 min-h-40 pt-4 pb-2 px-4 bg-white border shadow-sm dark:bg-neutral-800 rounded-md">
							<h3 className="mb-3">Stroke Width</h3>
							<Slider
								defaultValue={[canvasValue.strokeWidth]}
								max={100}
								step={1}
								onValueChange={(value) => {
									canvasValue.setStrokeWidth(value[0]);
								}}
							/>
							<h3 className="mt-4 mb-3">Colours</h3>
							<CirclePicker
								color={canvasValue.borderColor}
								onChange={(color) => {
									console.log(color);
									canvasValue.setBorderColor(color.rgb);
								}}
							/>
						</div>
					)}
				</div>

				{/* Add Text */}
				<div className="relative w-max h-max">
					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									onClick={() => {
										handleOpen("text");
									}}
									className={cn(
										"aspect-square rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800",
										canvasValue.activeFilter === "text" &&
											"outline outline-black"
									)}
								>
									<MessageSquareMore className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Add Text</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					{canvasValue.activeFilter === "text" && (
						<div className="absolute left-16 -top-[200%] min-w-40 min-h-40 pt-4 pb-2 px-4 bg-white border shadow-sm dark:bg-neutral-800 rounded-md">
							<h3 className="mt-4 mb-3">Colours</h3>
							<CirclePicker
								color={canvasValue.color}
								onChange={(color) => {
									canvasValue.setColor(color.hex);
								}}
							/>
						</div>
					)}
				</div>

				{/* Signature */}
				<div className="relative w-max h-max">
					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									onClick={() => {
										handleOpen("signature");
									}}
									className="aspect-square rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800"
								>
									<Signature className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Signature</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					{canvasValue.activeFilter === "signature" && (
						<div className="absolute left-16 -top-[200%] min-w-40 min-h-40 pt-4 pb-2 px-4 bg-white border shadow-sm dark:bg-neutral-800 rounded-md">
							<h3 className="mb-3">Stroke Width</h3>
							<Slider
								defaultValue={[canvasValue.strokeWidth]}
								max={100}
								step={1}
								onValueChange={(value) => {
									canvasValue.setStrokeWidth(value[0]);
								}}
							/>
							<h3 className="mt-4 mb-3">Colours</h3>
							<CirclePicker
								color={canvasValue.color}
								onChange={(color) => {
									console.log(color);
									canvasValue.setBorderColor(color.rgb);
								}}
							/>
						</div>
					)}
				</div>

				{data.map((item, idx) => (
					<TooltipProvider key={idx} delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									key={idx}
									variant="ghost"
									onClick={item.onClick}
									className="aspect-square rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800"
								>
									{item.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{item.title}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				))}
				{/* Export */}
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								onClick={() => {
									if (canvasValue.canvas) {
										canvasValue.edits[canvasValue.currPage] =
											canvasValue.canvas.toObject();
									}
									setOpenExporter(true);
								}}
								className="aspect-square rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800"
							>
								<Download className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Export</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<ExportModal
					className="text-[1.5rem] cursor-pointer"
					open={openExporter}
					setOpen={setOpenExporter}
				/>
			</div>
		</div>
	);
}
