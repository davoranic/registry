import * as React from "react"

import "./aspect-ratio.css"

function AspectRatio(props: React.ComponentProps<"div">) {
  return <div data-slot="aspect-ratio" {...props}>{props.children}</div>
}

export { AspectRatio }
