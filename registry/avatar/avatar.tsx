import * as React from "react"
import { UserIcon } from "lucide-react"

import "./avatar.css"

type Size = "sm" | "md" | "lg"

export interface AvatarProps extends React.ComponentProps<"span"> {
  src?: string
  alt?: string
  /** initials text; falls back to the user icon role when omitted */
  fallback?: React.ReactNode
  size?: Size
}

function Avatar({ src, alt, fallback, size = "md", ...props }: AvatarProps) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error"
  )

  React.useEffect(() => {
    setStatus(src ? "loading" : "error")
  }, [src])

  return (
    <span
      data-slot="avatar"
      data-size={size === "md" ? undefined : size}
      {...props}
    >
      {src && status !== "error" && (
        <img
          data-slot="image"
          src={src}
          alt={alt ?? ""}
          hidden={status !== "loaded"}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
      {status !== "loaded" && (
        <span
          data-slot="fallback"
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
        >
          {fallback ?? <UserIcon aria-hidden="true" />}
        </span>
      )}
    </span>
  )
}

function AvatarGroup({ children, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="group" {...props}>
      {children}
    </span>
  )
}

export { Avatar, AvatarGroup }
