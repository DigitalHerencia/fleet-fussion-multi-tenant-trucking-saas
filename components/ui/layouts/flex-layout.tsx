import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const flexLayoutVariants = cva(
    "flex",
    {
        variants: {
            direction: {
                row: "flex-row",
                col: "flex-col",
                "row-reverse": "flex-row-reverse",
                "col-reverse": "flex-col-reverse"
            },
            align: {
                start: "items-start",
                center: "items-center",
                end: "items-end",
                stretch: "items-stretch",
                baseline: "items-baseline"
            },
            justify: {
                start: "justify-start",
                center: "justify-center", 
                end: "justify-end",
                between: "justify-between",
                around: "justify-around",
                evenly: "justify-evenly"
            },
            wrap: {
                wrap: "flex-wrap",
                nowrap: "flex-nowrap",
                "wrap-reverse": "flex-wrap-reverse"
            },
            gap: {
                0: "gap-0",
                1: "gap-1",
                2: "gap-2",
                3: "gap-3",
                4: "gap-4",
                5: "gap-5",
                6: "gap-6",
                8: "gap-8",
                10: "gap-10",
                12: "gap-12"
            }
        },
        defaultVariants: {
            direction: "row",
            align: "stretch",
            justify: "start",
            wrap: "nowrap",
            gap: 4
        }
    }
)

interface FlexLayoutProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof flexLayoutVariants> {}

export function FlexLayout({
    className,
    direction,
    align,
    justify,
    wrap,
    gap,
    ...props
}: FlexLayoutProps) {
    return (
        <div
            className={cn(flexLayoutVariants({ direction, align, justify, wrap, gap }), className)}
            {...props}
        />
    )
}
