import * as React from "react"

import "./kbd.css"

function Kbd(props: React.ComponentProps<"div">) {
  return <div data-slot="kbd" {...props}>{props.children}</div>
}

export { Kbd }
