"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterX, Funnel } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export default function ColumnFilter({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleApplyFilter = () => {
    onChange(inputValue);
    setIsOpen(false);
  };
  const handleClearFilter = () => {
    onChange("");
    setInputValue("");
    setIsOpen(false);
  };

  return (
    <div>
      {label}
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-1 text-primary"
          onClick={handleClearFilter}
        >
          <FilterX className="h-4 w-4" />
        </Button>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-1">
              <Funnel className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            {type === "date" ? (
              <Input
                type="date"
                value={inputValue}
                onChange={(e) => {
                  // convert the UTC timestamp into the local timezone
                  const localDate = toZonedTime(
                    e.target.value,
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                  );
                  setInputValue(format(localDate, "yyyy-MM-dd"));
                }}
                placeholder={placeholder || "Filter..."}
                className="mb-2"
              />
            ) : type === "text" ? (
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder || "Filter..."}
                className="mb-2"
              />
            ) : null}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleApplyFilter}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
