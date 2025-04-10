import type React from "react"
export const Chart = () => {
  return null
}

export const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export const ChartTooltip = ({ content }: { content: React.ReactNode }) => {
  return <>{content}</>
}

export const ChartTooltipContent = ({
  className,
  items,
}: { className?: string; items: { label: string; value: (data: any) => any; color?: string }[] }) => {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index}>
          {item.label}: {item.value({})}
        </div>
      ))}
    </div>
  )
}

export const ChartLegend = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return <div className={className}>{children}</div>
}

export const ChartLegendItem = ({ label, color }: { label: string; color: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span>{label}</span>
    </div>
  )
}
