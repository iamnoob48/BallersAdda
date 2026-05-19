import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "./button.jsx"

function CalendarPicker({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar p-3 [--cell-radius:theme(borderRadius.xl)] [--cell-size:--spacing(8)]",
        "bg-[#1a1a1a] text-white rounded-2xl border border-[#2a2a2a]",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code || "default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all",
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          "hover:bg-[#00FF88]/10 hover:text-[#00FF88] text-[#aaa]",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all",
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          "hover:bg-[#00FF88]/10 hover:text-[#00FF88] text-[#aaa]",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-(--cell-radius) border border-[#2a2a2a] shadow-sm",
          "has-focus:border-[#00FF88] has-focus:ring-[3px] has-focus:ring-[#00FF88]/20",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-[#111] opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-medium select-none text-white",
          captionLayout === "label"
            ? "text-sm"
            : "flex h-8 items-center gap-1 rounded-(--cell-radius) pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-[#888]",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-[#666] select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-[#666] select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none",
          "[&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-[#00FF88]/10",
          "after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-[#00FF88]/10",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-[#00FF88]/10",
          "after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-[#00FF88]/10",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-(--cell-radius) bg-[#00FF88]/10 text-[#00FF88] data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-[#555] aria-selected:text-[#888]",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-[#555] opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("cn-rtl-flip size-4", className)}
                {...props}
              />
            )
          }
          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("cn-rtl-flip size-4", className)}
                {...props}
              />
            )
          }
          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: (buttonProps) => (
          <CalendarPickerDayButton locale={locale} {...buttonProps} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarPickerDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        // Layout
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1",
        "border-0 leading-none font-normal text-[#ccc]",
        // Hover
        "hover:bg-[#00FF88]/10 hover:text-[#00FF88]",
        // Focus
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10",
        "group-data-[focused=true]/day:border-[#00FF88] group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-[#00FF88]/20",
        // Range end
        "data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius)",
        "data-[range-end=true]:bg-[#00FF88] data-[range-end=true]:text-[#0e0e10]",
        // Range middle
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-[#00FF88]/10 data-[range-middle=true]:text-white",
        // Range start
        "data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius)",
        "data-[range-start=true]:bg-[#00FF88] data-[range-start=true]:text-[#0e0e10]",
        // Single selected
        "data-[selected-single=true]:bg-[#00FF88] data-[selected-single=true]:text-[#0e0e10] data-[selected-single=true]:font-semibold",
        // Sub-elements
        "[&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { CalendarPicker, CalendarPickerDayButton }
