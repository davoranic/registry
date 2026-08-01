import * as React from "react"
import { SearchIcon } from "lucide-react"

import "./command.css"

export interface CommandOption {
  /* the option's accessible name and the filter key */
  label: string
  icon?: React.ReactNode
  /* keyboard hint; aria-hidden because it belongs in the name only once */
  shortcut?: string
  /* groups related options into a role=group */
  group?: string
  /* a CHOSEN option — distinct from the ACTIVE (aria-activedescendant) one */
  selected?: boolean
  disabled?: boolean
  onSelect?: () => void
}

export interface CommandProps {
  options: CommandOption[]
  placeholder?: string
  emptyMessage?: string
  /* names the combobox and its listbox */
  label?: string
  value?: string
  onValueChange?: (value: string) => void
  filter?: (option: CommandOption, query: string) => boolean
}

const defaultFilter = (option: CommandOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase())

/* APG combobox with a listbox popup: the input keeps DOM focus and options are
   never focused, only made active via aria-activedescendant. ArrowDown/ArrowUp
   move the active option (wrapping), Home/End jump, Enter runs it. Dismissal
   and the focus trap belong to the hosting dialog (anatomy/dialog.json). */
function Command({
  options,
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  label = "Command",
  value,
  onValueChange,
  filter = defaultFilter,
}: CommandProps) {
  const baseId = React.useId()
  const listId = `${baseId}-list`
  const optionId = (index: number) => `${baseId}-option-${index}`

  const [internalValue, setInternalValue] = React.useState("")
  const query = value !== undefined ? value : internalValue
  const [activeIndex, setActiveIndex] = React.useState(0)
  const listRef = React.useRef<HTMLDivElement>(null)

  const results = React.useMemo(
    () => options.filter((option) => (query ? filter(option, query) : true)),
    [options, query, filter]
  )

  const selectable = results.reduce<number[]>((acc, option, index) => {
    if (!option.disabled) acc.push(index)
    return acc
  }, [])

  /* filtering is live — the active option resets to the first result */
  React.useEffect(() => {
    setActiveIndex(selectable[0] ?? -1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, options])

  /* the list scrolls the active option into view; it is never focused */
  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-slot="item"][data-active]')
      ?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, query])

  const setQuery = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  const move = (delta: number) => {
    if (selectable.length === 0) return
    const position = selectable.indexOf(activeIndex)
    const next = (position + delta + selectable.length) % selectable.length
    setActiveIndex(selectable[position === -1 ? 0 : next])
  }

  const run = (index: number) => {
    const option = results[index]
    if (!option || option.disabled) return
    option.onSelect?.()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        move(1)
        return
      case "ArrowUp":
        event.preventDefault()
        move(-1)
        return
      case "Home":
        event.preventDefault()
        setActiveIndex(selectable[0] ?? -1)
        return
      case "End":
        event.preventDefault()
        setActiveIndex(selectable[selectable.length - 1] ?? -1)
        return
      case "Enter":
        event.preventDefault()
        run(activeIndex)
        return
      default:
    }
  }

  /* group the filtered results while keeping their absolute indexes */
  const groups: { name?: string; entries: [CommandOption, number][] }[] = []
  results.forEach((option, index) => {
    const last = groups[groups.length - 1]
    if (last && last.name === option.group) last.entries.push([option, index])
    else groups.push({ name: option.group, entries: [[option, index]] })
  })

  const renderOption = (option: CommandOption, index: number) => (
    <div
      key={index}
      id={optionId(index)}
      data-slot="item"
      /* ACTIVE (roving virtual focus) and SELECTED are different and must
         stay distinguishable — anatomy/command.json */
      data-active={index === activeIndex ? "" : undefined}
      data-state={option.selected ? "selected" : undefined}
      data-disabled={option.disabled ? "" : undefined}
      role="option"
      aria-selected={option.selected ?? false}
      aria-disabled={option.disabled || undefined}
      onMouseEnter={() => !option.disabled && setActiveIndex(index)}
      onClick={() => run(index)}
    >
      {option.icon && (
        <span data-slot="item-icon" aria-hidden="true">
          {option.icon}
        </span>
      )}
      <span data-slot="item-label">{option.label}</span>
      {option.shortcut && (
        <span data-slot="item-shortcut" aria-hidden="true">
          {option.shortcut}
        </span>
      )}
    </div>
  )

  return (
    <div data-slot="command" data-state="open">
      <div data-slot="input-row">
        <span data-slot="search-icon" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          data-slot="input"
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-label={label}
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div
        ref={listRef}
        id={listId}
        data-slot="list"
        role="listbox"
        aria-label={label}
      >
        {results.length === 0 ? (
          <div data-slot="empty">{emptyMessage}</div>
        ) : (
          groups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && <div data-slot="separator" role="separator" />}
              <div data-slot="group" role="group" aria-label={group.name}>
                {group.name && (
                  <div data-slot="group-label">{group.name}</div>
                )}
                {group.entries.map(([option, index]) =>
                  renderOption(option, index)
                )}
              </div>
            </React.Fragment>
          ))
        )}
      </div>
      {/* the result count — including 'no results' — is announced politely */}
      <div data-slot="live-region" role="status" aria-live="polite">
        {results.length === 0
          ? emptyMessage
          : `${results.length} result${results.length === 1 ? "" : "s"} available.`}
      </div>
    </div>
  )
}

export { Command }
