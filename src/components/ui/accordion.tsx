"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  value: string[]
  onValueChange: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(
  undefined
)

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type?: "single" | "multiple"
    defaultValue?: string | string[]
    value?: string | string[]
    onValueChange?: (value: string | string[]) => void
    collapsible?: boolean
  }
>(
  (
    {
      className,
      type = "single",
      defaultValue,
      value: controlledValue,
      onValueChange,
      collapsible = true,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(
      () => {
        if (defaultValue === undefined) return []
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
      }
    )

    const value = controlledValue
      ? Array.isArray(controlledValue)
        ? controlledValue
        : [controlledValue]
      : uncontrolledValue

    const handleValueChange = React.useCallback(
      (newValue: string[]) => {
        if (onValueChange) {
          if (type === "single") {
            onValueChange(newValue[0] || "")
          } else {
            onValueChange(newValue)
          }
        } else {
          setUncontrolledValue(newValue)
        }
      },
      [onValueChange, type]
    )

    const toggleItem = React.useCallback(
      (itemValue: string) => {
        if (type === "single") {
          const isCurrentlyOpen = value.includes(itemValue)
          if (isCurrentlyOpen && !collapsible) return
          handleValueChange(isCurrentlyOpen ? [] : [itemValue])
        } else {
          handleValueChange(
            value.includes(itemValue)
              ? value.filter((v) => v !== itemValue)
              : [...value, itemValue]
          )
        }
      },
      [type, value, handleValueChange, collapsible]
    )

    return (
      <AccordionContext.Provider  value={{ value, onValueChange: toggleItem }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemContextValue {
  value: string
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(
  undefined
)

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error("AccordionItem must be used within Accordion")

  const isOpen = context.value.includes(value)

  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div
        ref={ref}
        className={cn("border-b border-border", className)}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      />
    </AccordionItemContext.Provider>
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const accordionContext = React.useContext(AccordionContext)
  const itemContext = React.useContext(AccordionItemContext)
  
  if (!accordionContext || !itemContext) {
    throw new Error("AccordionTrigger must be used within AccordionItem")
  }

  const isOpen = accordionContext.value.includes(itemContext.value)

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      onClick={() => accordionContext.onValueChange(itemContext.value)}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const accordionContext = React.useContext(AccordionContext)
  const itemContext = React.useContext(AccordionItemContext)
  
  if (!accordionContext || !itemContext) {
    throw new Error("AccordionContent must be used within AccordionItem")
  }

  const isOpen = accordionContext.value.includes(itemContext.value)

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all",
        isOpen ? "animate-accordion-down" : "animate-accordion-up"
      )}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
