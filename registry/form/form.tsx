import * as React from "react"
import { OctagonXIcon } from "lucide-react"

import "./form.css"

type LabelPlacement = "top" | "start"

const LabelPlacementContext = React.createContext<LabelPlacement>("top")

interface FormItemContextValue {
  controlId: string
  descriptionId: string
  messageId: string
  invalid: boolean
  disabled: boolean
  readOnly: boolean
  hasMessage: boolean
  setHasMessage: (value: boolean) => void
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

function useFormItem(component: string) {
  const context = React.useContext(FormItemContext)
  if (!context) throw new Error(`<${component}> must be used within <FormItem>`)
  return context
}

export interface FormProps extends React.ComponentProps<"form"> {
  /** Contract axis (contract/patterns.md §Layout tokens). */
  labelPlacement?: LabelPlacement
}

/**
 * Native <form> semantics (contract/anatomy/form.json). APG form guidance:
 * every control takes its accessible name from its label (for/id), the
 * description and message are wired through aria-describedby, an invalid
 * control carries aria-invalid, the message is announced (role=alert), and
 * failure is never signalled by colour alone. On a failed submit focus moves
 * to the first invalid control.
 */
function Form({
  labelPlacement = "top",
  onSubmit,
  children,
  ...props
}: FormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    onSubmit?.(event)
    const firstInvalid = event.currentTarget.querySelector<HTMLElement>(
      '[aria-invalid="true"]'
    )
    if (firstInvalid) {
      event.preventDefault()
      firstInvalid.focus()
    }
  }
  return (
    <LabelPlacementContext.Provider value={labelPlacement}>
      <form
        data-slot="form"
        data-label-placement={labelPlacement}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    </LabelPlacementContext.Provider>
  )
}

export interface FormItemProps extends React.ComponentProps<"div"> {
  invalid?: boolean
  disabled?: boolean
  readOnly?: boolean
}

/** One labelled control with its description/message — the same stack as the
 *  field anatomy, owned by the form so validation state flows from the form
 *  model. */
function FormItem({
  invalid = false,
  disabled = false,
  readOnly = false,
  children,
  ...props
}: FormItemProps) {
  const controlId = React.useId()
  const [hasMessage, setHasMessage] = React.useState(false)
  return (
    <FormItemContext.Provider
      value={{
        controlId,
        descriptionId: `${controlId}-description`,
        messageId: `${controlId}-message`,
        invalid,
        disabled,
        readOnly,
        hasMessage,
        setHasMessage,
      }}
    >
      <div
        data-slot="item"
        data-state={invalid ? "invalid" : readOnly ? "readonly" : undefined}
        data-disabled={disabled ? "" : undefined}
        {...props}
      >
        {children}
      </div>
    </FormItemContext.Provider>
  )
}

export interface FormLabelProps extends React.ComponentProps<"label"> {
  /** Salt's necessityLabel — a recipe addition inside the label, not a part. */
  necessity?: React.ReactNode
}

function FormLabel({ necessity, children, ...props }: FormLabelProps) {
  const { controlId, invalid, disabled } = useFormItem("FormLabel")
  return (
    <label
      data-slot="label"
      htmlFor={controlId}
      data-state={invalid ? "invalid" : undefined}
      data-disabled={disabled ? "" : undefined}
      {...props}
    >
      {children}
      {necessity && <span data-slot="necessity">{necessity}</span>}
    </label>
  )
}

/**
 * Hosts any form control anatomy (input, textarea, select, checkbox,
 * radio-group, switch, slider). Carries no tokens of its own — it only
 * passes id / aria-describedby / aria-invalid down from the item.
 */
function FormControl({ children, ...props }: React.ComponentProps<"div">) {
  const {
    controlId,
    descriptionId,
    messageId,
    invalid,
    disabled,
    readOnly,
    hasMessage,
  } = useFormItem("FormControl")
  const describedBy =
    [invalid && hasMessage ? messageId : descriptionId].filter(Boolean).join(" ") ||
    undefined
  return (
    <div data-slot="control" {...props}>
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<Record<string, unknown>>,
            {
              id: controlId,
              "aria-describedby": describedBy,
              "aria-invalid": invalid || undefined,
              disabled,
              readOnly,
            }
          )
        : children}
    </div>
  )
}

/** Replaced by the message while the control is invalid. */
function FormDescription({ children, ...props }: React.ComponentProps<"p">) {
  const { descriptionId, invalid, hasMessage } = useFormItem("FormDescription")
  if (invalid && hasMessage) return null
  return (
    <p data-slot="description" id={descriptionId} {...props}>
      {children}
    </p>
  )
}

/** Validation message — announced, and never colour-only: it carries the
 *  error icon role alongside the text. */
function FormMessage({ children, ...props }: React.ComponentProps<"p">) {
  const { messageId, setHasMessage } = useFormItem("FormMessage")
  const present = Boolean(children)
  React.useEffect(() => {
    setHasMessage(present)
    return () => setHasMessage(false)
  }, [present, setHasMessage])
  if (!present) return null
  return (
    <p data-slot="message" id={messageId} role="alert" {...props}>
      <OctagonXIcon aria-hidden="true" />
      {children}
    </p>
  )
}

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}
