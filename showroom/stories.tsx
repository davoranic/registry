import * as React from "react"

import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "../registry/accordion/accordion"
import { Alert } from "../registry/alert/alert"
import { AlertDialog } from "../registry/alert-dialog/alert-dialog"
import { AspectRatio } from "../registry/aspect-ratio/aspect-ratio"
import { Avatar } from "../registry/avatar/avatar"
import { Badge } from "../registry/badge/badge"
import { Breadcrumb } from "../registry/breadcrumb/breadcrumb"
import { Button } from "../registry/button/button"
import { ButtonGroup } from "../registry/button-group/button-group"
import { Calendar } from "../registry/calendar/calendar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../registry/card/card"
import { Carousel } from "../registry/carousel/carousel"
import { Chart } from "../registry/chart/chart"
import { Checkbox } from "../registry/checkbox/checkbox"
import { Collapsible } from "../registry/collapsible/collapsible"
import { Command } from "../registry/command/command"
import { ContextMenu } from "../registry/context-menu/context-menu"
import { Dialog } from "../registry/dialog/dialog"
import { Drawer } from "../registry/drawer/drawer"
import { DropdownMenu } from "../registry/dropdown-menu/dropdown-menu"
import { Empty } from "../registry/empty/empty"
import { Field } from "../registry/field/field"
import { HoverCard } from "../registry/hover-card/hover-card"
import { Icon } from "../registry/icon/icon"
import { Input } from "../registry/input/input"
import { InputGroup } from "../registry/input-group/input-group"
import { InputOTP } from "../registry/input-otp/input-otp"
import { Item } from "../registry/item/item"
import { Kbd } from "../registry/kbd/kbd"
import { Label } from "../registry/label/label"
import { Menubar } from "../registry/menubar/menubar"
import { NativeSelect } from "../registry/native-select/native-select"
import { NavigationMenu } from "../registry/navigation-menu/navigation-menu"
import { Pagination } from "../registry/pagination/pagination"
import { Popover } from "../registry/popover/popover"
import { Progress } from "../registry/progress/progress"
import { RadioGroup, RadioGroupItem } from "../registry/radio-group/radio-group"
import { Resizable, ResizablePanel, ResizableHandle } from "../registry/resizable/resizable"
import { ScrollArea } from "../registry/scroll-area/scroll-area"
import { Select } from "../registry/select/select"
import { Separator } from "../registry/separator/separator"
import { Sheet } from "../registry/sheet/sheet"
import { Sidebar } from "../registry/sidebar/sidebar"
import { Skeleton } from "../registry/skeleton/skeleton"
import { Slider } from "../registry/slider/slider"
import { Spinner } from "../registry/spinner/spinner"
import { Switch } from "../registry/switch/switch"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../registry/table/table"
import { Tabs, TabsList, TabsTrigger, TabsPanel } from "../registry/tabs/tabs"
import { Textarea } from "../registry/textarea/textarea"
import { Toggle } from "../registry/toggle/toggle"
import { ToggleGroup } from "../registry/toggle-group/toggle-group"
import { Tooltip } from "../registry/tooltip/tooltip"

export type Args = Record<string, string | boolean>

/** Errors in one story never take down the canvas. */
export class Boundary extends React.Component<
  { name: string; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidUpdate(prev: { children: React.ReactNode }) {
    if (prev.children !== this.props.children && this.state.error) this.setState({ error: null })
  }
  render() {
    if (this.state.error) {
      return <div data-story-error>
        <b>{this.props.name}</b> threw at render
        <code>{String(this.state.error.message).slice(0, 160)}</code>
      </div>
    }
    return this.props.children
  }
}

/* --------------------------------------------------------- stateful helpers */

function useToggle(initial: boolean) {
  return React.useState(initial)
}

/* ------------------------------------------------------------------ stories */

export interface Story {
  name: string
  group: string
  render: (a: Args) => React.ReactNode
}

const S = (name: string, group: string, render: (a: Args) => React.ReactNode): Story =>
  ({ name, group, render })

function CheckboxStory(a: Args) {
  const [v, setV] = React.useState<boolean | "indeterminate">(true)
  return <Checkbox
    checked={a.indeterminate ? "indeterminate" : v}
    onCheckedChange={setV}
    disabled={a.disabled as boolean}
    invalid={a.invalid as boolean}
    readOnly={a.readonly as boolean}
    label="All-or-none"
    description="Fill the whole order or none of it"
  />
}

function SwitchStory(a: Args) {
  const [on, setOn] = useToggle(true)
  return <Switch checked={on} onCheckedChange={setOn} size={a.size as any}
                 disabled={a.disabled as boolean} label="Notify on fill" />
}

function RadioStory(a: Args) {
  const [v, setV] = React.useState("smart")
  return (
    <RadioGroup value={v} onValueChange={setV} orientation={a.orientation as any}
                disabled={a.disabled as boolean} invalid={a.invalid as boolean}>
      <RadioGroupItem value="smart" label="Smart route" />
      <RadioGroupItem value="direct" label="Direct (ARCA)" />
      <RadioGroupItem value="dark" label="Dark pool" />
    </RadioGroup>
  )
}

function SliderStory(a: Args) {
  const [v, setV] = React.useState(55)
  return <Slider value={v} onValueChange={setV} orientation={a.orientation as any}
                 size={a.size as any} disabled={a.disabled as boolean}
                 showValue label="Limit price" />
}

function TabsStory(a: Args) {
  const [tab, setTab] = React.useState("account")
  return (
    <Tabs value={tab} onValueChange={setTab} orientation={a.orientation as any}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsPanel value="account">Make changes to your account here.</TabsPanel>
      <TabsPanel value="password">Change your password here.</TabsPanel>
      <TabsPanel value="team">Manage who has access.</TabsPanel>
    </Tabs>
  )
}

function DialogStory(a: Args) {
  const [open, setOpen] = React.useState(Boolean(a.open))
  React.useEffect(() => setOpen(Boolean(a.open)), [a.open])
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onOpenChange={setOpen} size={a.size as any}
              title="Are you absolutely sure?"
              description="This permanently deletes the record and cannot be undone."
              footer={<>
                <Button emphasis="secondary" prominence="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button emphasis="danger" onClick={() => setOpen(false)}>Delete</Button>
              </>} />
    </>
  )
}

function SelectStory(a: Args) {
  const [v, setV] = React.useState("")
  return <Select value={v} onValueChange={setV} disabled={a.disabled as boolean}
                 invalid={a.invalid as boolean} placeholder="Select a framework…"
                 options={[
                   { value: "next", label: "Next.js" },
                   { value: "vite", label: "Vite" },
                   { value: "remix", label: "Remix" },
                   { value: "astro", label: "Astro" },
                 ]} />
}

function ProgressStory(a: Args) {
  const [v, setV] = React.useState(38)
  React.useEffect(() => {
    const t = setInterval(() => setV((p) => (p >= 100 ? 0 : p + 3)), 700)
    return () => clearInterval(t)
  }, [])
  return <Progress value={v} label="Settlement" />
}

function ToggleStory(a: Args) {
  const [on, setOn] = useToggle(true)
  return <Toggle pressed={on} onPressedChange={setOn} size={a.size as any}
                 prominence={a.prominence as any} disabled={a.disabled as boolean}>Bold</Toggle>
}

function AccordionStory() {
  return (
    <Accordion>
      <AccordionItem value="a">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionPanel>Yes — it implements the APG accordion pattern.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Is it themed?</AccordionTrigger>
        <AccordionPanel>Entirely by contract slots. Switch the theme on the right.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export const STORIES: Story[] = [
  S("button", "Actions", (a) => (
    <Button emphasis={a.emphasis as any} prominence={a.prominence as any} size={a.size as any}
            disabled={a.disabled as boolean} loading={a.loading as boolean}>
      Submit order
    </Button>
  )),
  S("button-group", "Actions", () => (
    <ButtonGroup>
      <Button emphasis="secondary" prominence="outline">Day</Button>
      <Button emphasis="secondary" prominence="outline">Week</Button>
      <Button emphasis="secondary" prominence="outline">Month</Button>
    </ButtonGroup>
  )),
  S("toggle", "Actions", ToggleStory),
  S("toggle-group", "Actions", (a) => (
    <ToggleGroup orientation={a.orientation as any} defaultValue="center"
                 items={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
  )),
  S("icon", "Actions", (a) => (
    <div style={{ display: "flex", gap: "var(--space-inline-lg)" }}>
      {["search", "calendar", "user", "success", "warning", "error"].map((r) => (
        <Icon key={r} role={r as any} size={a.size as any} />
      ))}
    </div>
  )),
  S("kbd", "Actions", () => <span style={{ display: "flex", gap: 4 }}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>),

  S("input", "Forms", (a) => <Input placeholder="m@example.com" disabled={a.disabled as boolean}
                                    aria-invalid={a.invalid ? true : undefined} readOnly={a.readonly as boolean} />),
  S("textarea", "Forms", (a) => <Textarea placeholder="Notes…" rows={3} disabled={a.disabled as boolean} />),
  S("label", "Forms", () => <Label htmlFor="x">Email address</Label>),
  S("field", "Forms", (a) => (
    <Field label="Quantity" description="Round lots only."
           error={a.invalid ? "Enter a whole number of lots." : undefined}
           disabled={a.disabled as boolean} orientation={a.orientation as any}>
      <Input defaultValue="1,200" />
    </Field>
  )),
  S("checkbox", "Forms", CheckboxStory),
  S("radio-group", "Forms", RadioStory),
  S("switch", "Forms", SwitchStory),
  S("slider", "Forms", SliderStory),
  S("select", "Forms", SelectStory),
  S("native-select", "Forms", (a) => <NativeSelect disabled={a.disabled as boolean}
      options={[{ value: "buy", label: "Buy" }, { value: "sell", label: "Sell" }, { value: "short", label: "Short" }]} />),
  S("input-group", "Forms", () => <InputGroup prefix="https://"><Input placeholder="example.com" /></InputGroup>),
  S("input-otp", "Forms", () => <InputOTP length={6} />),
  S("form", "Forms", () => (
    <Field label="Email" error="Enter a valid email address."><Input defaultValue="not-an-email" /></Field>
  )),
  S("calendar", "Forms", () => <Calendar />),

  S("card", "Display", () => (
    <Card>
      <CardHeader><CardTitle>Total revenue</CardTitle><CardDescription>Trailing 30 days</CardDescription></CardHeader>
      <CardContent>$45,231.89</CardContent>
      <CardFooter>+20.1% vs last month</CardFooter>
    </Card>
  )),
  S("badge", "Display", (a) => <Badge tone={(a.tone as any) ?? "success"} prominence={a.prominence as any}>Filled</Badge>),
  S("avatar", "Display", (a) => <Avatar fallback="DA" size={a.size as any} />),
  S("table", "Display", (a) => (
    <Table size={a.size as any}>
      <TableHeader><TableRow>
        <TableHead>Symbol</TableHead><TableHead>Position</TableHead><TableHead numeric>P&amp;L</TableHead>
      </TableRow></TableHeader>
      <TableBody>
        <TableRow><TableCell>AAPL</TableCell><TableCell>+12,000</TableCell><TableCell numeric>+23,040</TableCell></TableRow>
        <TableRow><TableCell>MSFT</TableCell><TableCell>+4,200</TableCell><TableCell numeric>+7,350</TableCell></TableRow>
        <TableRow><TableCell>NVDA</TableCell><TableCell>−2,500</TableCell><TableCell numeric>−16,000</TableCell></TableRow>
      </TableBody>
    </Table>
  )),
  S("separator", "Display", (a) => (
    <div style={{ inlineSize: 220 }}>
      <span>Above</span><Separator orientation={a.orientation as any} prominence={a.prominence as any} /><span>Below</span>
    </div>
  )),
  S("accordion", "Display", AccordionStory),
  S("collapsible", "Display", () => <Collapsible trigger="3 repositories">radix-ui/primitives<br />radix-ui/colors<br />radix-ui/icons</Collapsible>),
  S("aspect-ratio", "Display", () => <AspectRatio ratio={16 / 9}><span>16 : 9</span></AspectRatio>),
  S("item", "Display", () => <Item title="Notification settings" description="Choose how you are notified." />),
  S("empty", "Display", () => <Empty title="No projects" description="Create your first project to get started." />),
  S("skeleton", "Display", () => (
    <div style={{ display: "grid", gap: 8, inlineSize: 220 }}>
      <Skeleton style={{ blockSize: 12 }} /><Skeleton style={{ blockSize: 12, inlineSize: "70%" }} />
    </div>
  )),
  S("chart", "Display", () => <Chart data={[
    { label: "Jan", value: 186 }, { label: "Feb", value: 305 }, { label: "Mar", value: 237 },
    { label: "Apr", value: 273 }, { label: "May", value: 209 }, { label: "Jun", value: 264 }]} />),
  S("carousel", "Display", () => <Carousel items={[<span key="1">Slide 1</span>, <span key="2">Slide 2</span>, <span key="3">Slide 3</span>]} />),

  S("alert", "Feedback", (a) => <Alert tone={(a.tone as any) ?? "info"} title="Market data delayed"
                                       description="Pricing for LSE instruments is delayed by 15 minutes." />),
  S("progress", "Feedback", ProgressStory),
  S("spinner", "Feedback", (a) => <Spinner size={a.size as any} />),
  S("sonner", "Feedback", () => <Alert tone="success" title="Order filled" description="12,000 AAPL at 184.32." />),
  S("tooltip", "Feedback", () => <Tooltip content="Round lots only"><Button emphasis="secondary" prominence="outline">Hover me</Button></Tooltip>),

  S("dialog", "Overlays", DialogStory),
  S("alert-dialog", "Overlays", () => <AlertDialog trigger={<Button emphasis="danger">Delete</Button>}
                                                   title="Delete this record?" description="This cannot be undone." />),
  S("drawer", "Overlays", (a) => <Drawer edge={a.edge as any} trigger={<Button emphasis="secondary" prominence="outline">Open drawer</Button>} title="Order details" />),
  S("sheet", "Overlays", (a) => <Sheet edge={a.edge as any} trigger={<Button emphasis="secondary" prominence="outline">Open sheet</Button>} title="Edit profile" />),
  S("popover", "Overlays", () => <Popover trigger={<Button emphasis="secondary" prominence="outline">Open popover</Button>}>Set the dimensions for the layer.</Popover>),
  S("hover-card", "Overlays", () => <HoverCard trigger={<a href="#s">@nextjs</a>}>The React framework — created and maintained by Vercel.</HoverCard>),
  S("dropdown-menu", "Overlays", () => <DropdownMenu trigger={<Button emphasis="secondary" prominence="outline">Options</Button>}
      items={[{ label: "Profile" }, { label: "Settings" }, { label: "Log out", emphasis: "danger" }]} />),
  S("context-menu", "Overlays", () => <ContextMenu items={[{ label: "Back" }, { label: "Reload" }, { label: "Delete", emphasis: "danger" }]}>
      Right-click inside this area</ContextMenu>),

  S("tabs", "Navigation", TabsStory),
  S("breadcrumb", "Navigation", () => <Breadcrumb items={[{ label: "Home", href: "#s" }, { label: "Components", href: "#s" }, { label: "Breadcrumb" }]} />),
  S("pagination", "Navigation", () => <Pagination page={2} pageCount={6} />),
  S("menubar", "Navigation", () => <Menubar menus={[
      { label: "File", items: [{ label: "New tab" }, { label: "New window" }] },
      { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] }]} />),
  S("navigation-menu", "Navigation", (a) => <NavigationMenu orientation={a.orientation as any}
      items={[{ label: "Overview", href: "#s", current: true }, { label: "Docs", href: "#s" }, { label: "Support", href: "#s" }]} />),
  S("command", "Navigation", () => <Command items={[{ label: "Calendar" }, { label: "Search settings" }, { label: "Open profile" }]} />),
  S("sidebar", "Navigation", (a) => <Sidebar edge={a.edge as any}
      items={[{ label: "Dashboard", current: true }, { label: "Invoices" }, { label: "Customers" }]} />),

  S("scroll-area", "Layout", () => (
    <ScrollArea style={{ blockSize: 140, inlineSize: 220 }}>
      {Array.from({ length: 14 }, (_, i) => <div key={i}>v1.2.0-beta.{50 - i}</div>)}
    </ScrollArea>
  )),
  S("resizable", "Layout", (a) => (
    <Resizable orientation={a.orientation as any} style={{ blockSize: 140, inlineSize: 320 }}>
      <ResizablePanel>One</ResizablePanel><ResizableHandle /><ResizablePanel>Two</ResizablePanel>
    </Resizable>
  )),
]
