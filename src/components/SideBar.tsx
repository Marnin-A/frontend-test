import { useCanvas } from "@/store/CanvasStore";
import {
	Download,
	LucideHighlighter,
	MessageSquareMore,
	Palette,
	Signature,
	Trash,
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

export default function SideBar() {
	const canvasValue = useCanvas();
	const data = React.useMemo(
		() => [
			{
				title: "Highlight",
				icon: (
					<LucideHighlighter className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
				),
				onClick: () =>
					canvasValue.addHighlight(canvasValue.canvas as fabric.Canvas),
			},
			{
				title: "Underline",
				icon: (
					<Underline className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
				),
				onClick: () =>
					canvasValue.drawUnderline(canvasValue.canvas as fabric.Canvas),
			},
			{
				title: "Add Text",
				icon: (
					<MessageSquareMore className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
				),
				onClick: () => canvasValue.addText(canvasValue.canvas as fabric.Canvas),
			},
			{
				title: "Add Signature",
				icon: (
					<Signature className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
				),
				onClick: () =>
					canvasValue.toggleDraw(canvasValue.canvas as fabric.Canvas),
			},
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
				title: "Clear All",
				icon: (
					<Trash className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
				),
				onClick: () => canvasValue.deleteBtn(),
			},
			{
				title: "Export",
				icon: (
					<Download className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
				),
				onClick: () => canvasValue.exportPdf(),
			},
		],
		[canvasValue]
	);

	return (
		<div className="fixed z-50 top-[20%] left-0 h-max md:mx-16">
			<div className="flex flex-col gap-4">
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
				{/* Open Color wheel */}
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								// onClick={}
								className="aspect-square rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800"
							>
								<Palette />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Change Colour</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
}
