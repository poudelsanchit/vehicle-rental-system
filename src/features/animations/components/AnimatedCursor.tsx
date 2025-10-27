import { MousePointer2, LucideIcon } from "lucide-react";
import { CursorWrapper } from "./cursor-core";

type CursorProps = {
    cursorIcon?: LucideIcon;       // Icon component, not JSX
    iconColor?: string;            // Icon stroke color
    iconFill?: string;             // Icon fill color
    tooltipText?: string;          // Tooltip text
    showTooltip?: boolean;         // Show/hide tooltip
    tooltipClassName?: string;     // Optional extra styles
    iconSize?: number;             // Icon size in px
};

export default function AnimatedCursor({
    cursorIcon: Icon = MousePointer2,
    iconColor = "#1b1a1a",
    iconFill = "#000",
    tooltipText = "Click Me!",
    showTooltip = true,
    tooltipClassName = "",
    iconSize = 30,
}: CursorProps) {
    return (
        <CursorWrapper
            attachToParent
            variants={{
                initial: { scale: 0.3, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.3, opacity: 0 },
            }}
            transition={{
                ease: "circOut",
                duration: 0.15,
            }}
            className="pointer-events-none top-2 left-0"
        >
            <div className="relative">
                {/* Icon as a component */}
                <Icon color={iconColor} fill={iconFill} size={iconSize} />

                {showTooltip && (
                    <div
                        className={`absolute left-[24px] top-[24px] bg-[#1b1a1a]  text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg ${tooltipClassName}`}
                    >
                        {tooltipText}
                    </div>
                )}
            </div>
        </CursorWrapper>
    );
}
