import * as React from "react"

import "./label.css"

function Label(props: React.ComponentProps<"div">) {
  return <div data-slot="label" {...props}>{props.children}</div>
}

export { Label }
