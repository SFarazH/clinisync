"use client";

import { format, subDays, subMonths } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Label } from "./ui/label";

export function DateRangePicker() {
  const today = new Date();
  const oneWeekAgo = subDays(today, 7);
  const oneMonthAgo = subMonths(today, 1);
  const threeMonthsAgo = subMonths(today, 3);

  const [date, setDate] = useState({
    from: oneWeekAgo,
    to: today,
  });

  const [open, setOpen] = useState(false); // 👈 track popover state

  const handleQuickSelect = (rangeType) => {
    let newRange;
    switch (rangeType) {
      case "week":
        newRange = { from: subDays(new Date(), 7), to: new Date() };
        break;
      case "month":
        newRange = { from: subMonths(new Date(), 1), to: new Date() };
        break;
      case "3months":
        newRange = { from: subMonths(new Date(), 3), to: new Date() };
        break;
      case "reset":
        newRange = null;
        break;
      default:
        return;
    }
    setDate(newRange);
    setOpen(false);
  };

  const handleDateSelect = (selected) => {
    setDate(selected);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* <Label htmlFor="isPaymentComplete">Date Range</Label> */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-center text-left font-normal whitespace-normal break-words",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="break-words whitespace-normal">
              {date?.from && date?.to
                ? `${format(date.from, "dd/MM/yy")} - ${format(
                    date.to,
                    "dd/MM/yy"
                  )}`
                : "Pick a date range"}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="flex w-auto p-0" align="left">
          <div className="flex flex-col border-r p-2 w-32 bg-muted/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickSelect("week")}
              className="justify-start"
            >
              Last 7 days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickSelect("month")}
              className="justify-start"
            >
              Last 1 month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickSelect("3months")}
              className="justify-start"
            >
              Last 3 months
            </Button>

            <div className="border-t my-2"></div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleQuickSelect("reset")}
              className="justify-start"
            >
              Reset
            </Button>
          </div>

          <div className="p-2">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={1}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
