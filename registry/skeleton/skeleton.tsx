import * as React from "react"

import "./skeleton.css"

function Skeleton(props: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" {...props}>{props.children}</div>
}

export { Skeleton }
