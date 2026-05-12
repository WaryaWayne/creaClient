"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

type ContactBudgetSelectProps = {
  id: string
  name: string
  required?: boolean
  defaultValue?: string
  describedBy?: string
}

const OPTIONS = [
  { value: "under-500", label: "Under $500 / month" },
  { value: "500-1500", label: "$500 - $1,500 / month" },
  { value: "1500-3000", label: "$1,500 - $3,000 / month" },
  { value: "3000-plus", label: "Over $3,000 / month" },
]

export default function ContactBudgetSelect({
  id,
  name,
  required = false,
  defaultValue = "",
  describedBy,
}: ContactBudgetSelectProps) {
  return (
    <>
      <Select
        defaultValue={defaultValue || null}
        id={id}
        name={name}
        required={required}
      >
        {/*<SelectTrigger
          aria-describedby={describedBy}
          data-field-control={name}
          render={<Button variant={"outline"} />}
          value={"under-500"}
        >
          Select your budget
        </SelectTrigger>*/}
        <SelectTrigger
          aria-describedby={describedBy}
          data-field-control={name}
          className="w-full justify-between bg-background px-4 py-3 text-sm"
        >
          <SelectValue placeholder="Select your budget" />
        </SelectTrigger>
        <SelectContent
          align="start"
          className={"mt-5 rounded-lg px-2 backdrop-blur-2xl"}
        >
          <SelectGroup>
            <SelectLabel>Budget</SelectLabel>
            {OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}
