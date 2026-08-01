import * as React from "react"

import "./input.css"

export interface InputProps extends React.ComponentProps<"input"> {
  prefixSlot?: React.ReactNode
  suffixSlot?: React.ReactNode
}

function Input({ prefixSlot, suffixSlot, className, ...props }: InputProps) {
  return (
    <span data-slot="input" className={className}>
      {prefixSlot && <span data-slot="prefix">{prefixSlot}</span>}
      <input data-slot="control" {...props} />
      {suffixSlot && <span data-slot="suffix">{suffixSlot}</span>}
    </span>
  )
}

export { Input }
