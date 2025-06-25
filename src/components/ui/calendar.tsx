"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import "./calendar.css"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout,
  ...props
}: CalendarProps) {
  const hasDropdowns = captionLayout?.includes('dropdown');
  
  return (
    <DayPicker
      captionLayout={captionLayout}
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3", 
        hasDropdowns && "calendar-with-dropdowns",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        dropdowns: "flex justify-center gap-1",
        months_dropdown: "appearance-none bg-transparent border border-input rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer min-w-[100px]",
        years_dropdown: "appearance-none bg-transparent border border-input rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer min-w-[80px]",
        dropdown: "appearance-none bg-transparent border border-input rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer min-w-[80px]",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day_button: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        },
        CaptionLabel: ({ children, ...props }) => {
          // Hide the default caption label when using dropdowns by returning empty span
          return hasDropdowns ? <span style={{ display: 'none' }} {...props}></span> : <span {...props}>{children}</span>
        },
        DropdownNav: ({ children, ...props }) => {
          // Override DropdownNav to ensure clean rendering with dropdowns only
          return <div {...props}>{children}</div>
        },
        Dropdown: ({ classNames, components, options, ...props }) => {
          // Override Dropdown to remove the duplicate text span
          return (
            <span className={classNames?.dropdown_root}>
              <select {...props} className={classNames?.dropdown}>
                {options?.map(({ value, label, disabled }) => (
                  <option key={value} value={value} disabled={disabled}>
                    {label}
                  </option>
                ))}
              </select>
            </span>
          )
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
