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

/** Safe wrapper: a component that throws still shows the rest of the showroom. */
class Boundary extends React.Component<
  { name: string; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <span data-demo-error title={String(this.state.error)}>
          {this.props.name} — runtime error
        </span>
      )
    }
    return this.props.children
  }
}

function Row({ children }: { children: React.ReactNode }) {
  return <div data-demo-row>{children}</div>
}

/* ---------- stateful demos ---------- */

function CheckboxDemo() {
  const [a, setA] = React.useState<boolean | "indeterminate">(true)
  const [b, setB] = React.useState(false)
  return (
    <Row>
      <Checkbox checked={a} onCheckedChange={setA} label="All-or-none" />
      <Checkbox checked={b} onCheckedChange={setB} label="Hidden order" description="Not shown on the book" />
      <Checkbox checked="indeterminate" label="Partial" />
      <Checkbox checked disabled label="Locked" />
    </Row>
  )
}

function SwitchDemo() {
  const [on, setOn] = React.useState(true)
  return (
    <Row>
      <Switch checked={on} onCheckedChange={setOn} label="Notify on fill" />
      <Switch checked={false} label="Off" />
      <Switch checked size="sm" label="Small" />
      <Switch checked disabled label="Disabled" />
    </Row>
  )
}

function RadioDemo() {
  const [v, setV] = React.useState("smart")
  return (
    <RadioGroup value={v} onValueChange={setV}>
      <RadioGroupItem value="smart" label="Smart route" />
      <RadioGroupItem value="direct" label="Direct (ARCA)" />
      <RadioGroupItem value="dark" label="Dark pool" />
    </RadioGroup>
  )
}

function SliderDemo() {
  const [v, setV] = React.useState(55)
  return <Slider value={v} onValueChange={setV} showValue label="Limit price" />
}

function TabsDemo() {
  const [tab, setTab] = React.useState("account")
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsPanel value="account">Make changes to your account here.</TabsPanel>
      <TabsPanel value="password">Change your password here.</TabsPanel>
      <TabsPanel value="team">Manage team members.</TabsPanel>
    </Tabs>
  )
}

function DialogDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone. It will permanently delete the record."
        footer={
          <>
            <Button emphasis="secondary" prominence="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Continue</Button>
          </>
        }
      />
    </>
  )
}

function SelectDemo() {
  const [v, setV] = React.useState("")
  return (
    <Select
      value={v}
      onValueChange={setV}
      placeholder="Select a framework…"
      options={[
        { value: "next", label: "Next.js" },
        { value: "vite", label: "Vite" },
        { value: "remix", label: "Remix" },
        { value: "astro", label: "Astro" },
      ]}
    />
  )
}

function AccordionDemo() {
  return (
    <Accordion>
      <AccordionItem value="a">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionPanel>Yes. It follows the APG accordion pattern.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Is it themed?</AccordionTrigger>
        <AccordionPanel>Entirely by contract slots — switch the theme above.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

function ProgressDemo() {
  const [v, setV] = React.useState(38)
  React.useEffect(() => {
    const t = setInterval(() => setV((p) => (p >= 100 ? 0 : p + 4)), 900)
    return () => clearInterval(t)
  }, [])
  return <Progress value={v} label="Settlement" />
}

function ToggleDemo() {
  const [on, setOn] = React.useState(true)
  return (
    <Row>
      <Toggle pressed={on} onPressedChange={setOn}>
        Bold
      </Toggle>
      <Toggle pressed={false}>Italic</Toggle>
      <Toggle pressed disabled>
        Locked
      </Toggle>
    </Row>
  )
}

/* ---------- the demo table ---------- */

export interface Demo {
  name: string
  group: string
  node: React.ReactNode
}

const raw: Array<[string, string, React.ReactNode]> = [
  ["button", "Actions", (
    <Row>
      <Button>Submit order</Button>
      <Button emphasis="secondary" prominence="outline">Cancel</Button>
      <Button emphasis="danger">Close position</Button>
      <Button emphasis="secondary" prominence="ghost">Ghost</Button>
      <Button loading>Working</Button>
      <Button disabled>Disabled</Button>
    </Row>
  )],
  ["button-group", "Actions", <ButtonGroup><Button emphasis="secondary" prominence="outline">Day</Button><Button emphasis="secondary" prominence="outline">Week</Button><Button emphasis="secondary" prominence="outline">Month</Button></ButtonGroup>],
  ["toggle", "Actions", <ToggleDemo />],
  ["toggle-group", "Actions", <ToggleGroup items={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} defaultValue="center" />],
  ["icon", "Actions", <Row><Icon role="search" /><Icon role="calendar" /><Icon role="user" /><Icon role="success" /><Icon role="warning" /><Icon role="error" /></Row>],
  ["kbd", "Actions", <Row><Kbd>⌘</Kbd><Kbd>K</Kbd></Row>],

  ["input", "Forms", <Input placeholder="m@example.com" />],
  ["textarea", "Forms", <Textarea placeholder="Notes…" rows={3} />],
  ["label", "Forms", <Label htmlFor="demo-x">Email address</Label>],
  ["field", "Forms", <Field label="Quantity" description="Round lots only."><Input defaultValue="1,200" /></Field>],
  ["checkbox", "Forms", <CheckboxDemo />],
  ["radio-group", "Forms", <RadioDemo />],
  ["switch", "Forms", <SwitchDemo />],
  ["slider", "Forms", <SliderDemo />],
  ["select", "Forms", <SelectDemo />],
  ["native-select", "Forms", <NativeSelect options={[{ value: "buy", label: "Buy" }, { value: "sell", label: "Sell" }]} />],
  ["input-group", "Forms", <InputGroup prefix="https://"><Input placeholder="example.com" /></InputGroup>],
  ["input-otp", "Forms", <InputOTP length={6} />],
  ["form", "Forms", <Field label="Email" error="Enter a valid email address."><Input defaultValue="not-an-email" /></Field>],
  ["calendar", "Forms", <Calendar />],

  ["card", "Display", (
    <Card>
      <CardHeader>
        <CardTitle>Total revenue</CardTitle>
        <CardDescription>Trailing 30 days</CardDescription>
      </CardHeader>
      <CardContent>$45,231.89</CardContent>
      <CardFooter>+20.1% vs last month</CardFooter>
    </Card>
  )],
  ["badge", "Display", <Row><Badge tone="success">Filled</Badge><Badge tone="warning">Pending</Badge><Badge tone="critical">Rejected</Badge><Badge tone="info">Queued</Badge></Row>],
  ["avatar", "Display", <Row><Avatar fallback="DA" /><Avatar fallback="KM" /><Avatar fallback="+3" /></Row>],
  ["table", "Display", (
    <Table>
      <TableHeader>
        <TableRow><TableHead>Symbol</TableHead><TableHead>Position</TableHead><TableHead numeric>P&amp;L</TableHead></TableRow>
      </TableHeader>
      <TableBody>
        <TableRow><TableCell>AAPL</TableCell><TableCell>+12,000</TableCell><TableCell numeric>+23,040</TableCell></TableRow>
        <TableRow><TableCell>NVDA</TableCell><TableCell>−2,500</TableCell><TableCell numeric>−16,000</TableCell></TableRow>
      </TableBody>
    </Table>
  )],
  ["separator", "Display", <div style={{ width: "100%" }}><span>Above</span><Separator /><span>Below</span></div>],
  ["accordion", "Display", <AccordionDemo />],
  ["collapsible", "Display", <Collapsible trigger="3 repositories">radix-ui/primitives<br />radix-ui/colors</Collapsible>],
  ["aspect-ratio", "Display", <AspectRatio ratio={16 / 9}><span>16 : 9</span></AspectRatio>],
  ["item", "Display", <Item title="Notification settings" description="Choose how you are notified." />],
  ["empty", "Display", <Empty title="No projects" description="Create your first project to get started." />],
  ["skeleton", "Display", <div style={{ display: "grid", gap: 8, width: 200 }}><Skeleton style={{ height: 12 }} /><Skeleton style={{ height: 12, width: "70%" }} /></div>],
  ["chart", "Display", <Chart data={[{ label: "Jan", value: 186 }, { label: "Feb", value: 305 }, { label: "Mar", value: 237 }, { label: "Apr", value: 273 }, { label: "May", value: 209 }]} />],
  ["carousel", "Display", <Carousel items={[<span key="1">Slide 1</span>, <span key="2">Slide 2</span>, <span key="3">Slide 3</span>]} />],

  ["alert", "Feedback", <Alert tone="info" title="Market data delayed" description="Pricing is delayed by 15 minutes." />],
  ["progress", "Feedback", <ProgressDemo />],
  ["spinner", "Feedback", <Row><Spinner /><Spinner size="lg" /></Row>],
  ["sonner", "Feedback", <Alert tone="success" title="Order filled" description="12,000 AAPL at 184.32." />],
  ["tooltip", "Feedback", <Tooltip content="Round lots only"><Button emphasis="secondary" prominence="outline">Hover me</Button></Tooltip>],

  ["dialog", "Overlays", <DialogDemo />],
  ["alert-dialog", "Overlays", <AlertDialog trigger={<Button emphasis="danger">Delete</Button>} title="Delete this record?" description="This cannot be undone." />],
  ["drawer", "Overlays", <Drawer trigger={<Button emphasis="secondary" prominence="outline">Open drawer</Button>} title="Order details" />],
  ["sheet", "Overlays", <Sheet trigger={<Button emphasis="secondary" prominence="outline">Open sheet</Button>} title="Edit profile" />],
  ["popover", "Overlays", <Popover trigger={<Button emphasis="secondary" prominence="outline">Open popover</Button>}>Dimensions and spacing.</Popover>],
  ["hover-card", "Overlays", <HoverCard trigger={<a href="#demo">@nextjs</a>}>The React framework.</HoverCard>],
  ["dropdown-menu", "Overlays", <DropdownMenu trigger={<Button emphasis="secondary" prominence="outline">Options</Button>} items={[{ label: "Profile" }, { label: "Settings" }, { label: "Log out", emphasis: "danger" }]} />],
  ["context-menu", "Overlays", <ContextMenu items={[{ label: "Back" }, { label: "Reload" }, { label: "Delete", emphasis: "danger" }]}>Right-click this area</ContextMenu>],

  ["tabs", "Navigation", <TabsDemo />],
  ["breadcrumb", "Navigation", <Breadcrumb items={[{ label: "Home", href: "#demo" }, { label: "Components", href: "#demo" }, { label: "Breadcrumb" }]} />],
  ["pagination", "Navigation", <Pagination page={2} pageCount={6} />],
  ["menubar", "Navigation", <Menubar menus={[{ label: "File", items: [{ label: "New tab" }, { label: "New window" }] }, { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] }]} />],
  ["navigation-menu", "Navigation", <NavigationMenu items={[{ label: "Overview", href: "#demo", current: true }, { label: "Docs", href: "#demo" }, { label: "Support", href: "#demo" }]} />],
  ["command", "Navigation", <Command items={[{ label: "Calendar" }, { label: "Search settings" }, { label: "Open profile" }]} />],
  ["sidebar", "Navigation", <Sidebar items={[{ label: "Dashboard", current: true }, { label: "Invoices" }, { label: "Customers" }]} />],

  ["scroll-area", "Layout", <ScrollArea style={{ height: 120, width: 200 }}>{Array.from({ length: 12 }, (_, i) => <div key={i}>v1.2.0-beta.{50 - i}</div>)}</ScrollArea>],
  ["resizable", "Layout", <Resizable style={{ height: 120 }}><ResizablePanel>One</ResizablePanel><ResizableHandle /><ResizablePanel>Two</ResizablePanel></Resizable>],
]

export const DEMOS: Demo[] = raw.map(([name, group, node]) => ({
  name,
  group,
  node: <Boundary name={name}>{node}</Boundary>,
}))
