import React, {useState, useRef, useImperativeHandle} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Menu, {MenuProps} from '@material-ui/core/Menu'
import MenuItem, {MenuItemProps} from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import clsx from 'clsx'

const TRANSPARENT = 'rgba(0,0,0,0)'
const useMenuItemStyles = makeStyles((theme) => ({
  root: (props) => ({
    backgroundColor: props.open ? theme.palette.action.hover : TRANSPARENT
  })
}))

const NestedMenuItem = React.forwardRef((props, ref) => {
  const {
    parentMenuOpen,
    component = 'div',
    label,
    rightIcon = <NavigateNextIcon />,
    children,
    className,
    tabIndex: tabIndexProp,
    MenuProps = {},
    ContainerProps: ContainerPropsProp = {},
    ...MenuItemProps
  } = props

  const { ref: containerRefProp, ...ContainerProps } = ContainerPropsProp

  const menuItemRef = useRef(null)
  useImperativeHandle(ref, () => menuItemRef.current)

  const containerRef = useRef(null)
  useImperativeHandle(containerRefProp, () => containerRef.current)

  const menuContainerRef = useRef(null)

  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)

  const handleMouseEnter = (event) => {
    setIsSubMenuOpen(true)

    if (ContainerProps && ContainerProps.onMouseEnter) {
      ContainerProps.onMouseEnter(event)
    }
  }
  const handleMouseLeave = (event) => {
    setIsSubMenuOpen(false)

    if (ContainerProps && ContainerProps.onMouseLeave) {
      ContainerProps.onMouseLeave(event)
    }
  }

  // Check if any immediate children are active
  const isSubmenuFocused = () => {
    const active = containerRef.current && containerRef.current.ownerDocument && containerRef.current.ownerDocument.activeElement
    const children = menuContainerRef.current && menuContainerRef.current.children ? menuContainerRef.current.children : []
    for (const child of children) {
      if (child === active) {
        return true
      }
    }
    return false
  }

  const handleFocus = (event) => {
    if (event.target === containerRef.current) {
      setIsSubMenuOpen(true)
    }

    if (ContainerProps && ContainerProps.onFocus) {
      ContainerProps.onFocus(event)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      return
    }

    if (isSubmenuFocused()) {
      event.stopPropagation()
    }

    const active = containerRef.current && containerRef.current.ownerDocument && containerRef.current.ownerDocument.activeElement

    if (event.key === 'ArrowLeft' && isSubmenuFocused() && containerRef.current) {
      containerRef.current.focus()
    }

    if (
      event.key === 'ArrowRight' &&
      event.target === containerRef.current &&
      event.target === active
    ) {
      const firstChild = menuContainerRef.current && menuContainerRef.current.children ? menuContainerRef.current.children[0] : null
      if (firstChild)
        firstChild.focus()
    }
  }

  const open = isSubMenuOpen && parentMenuOpen
  const menuItemClasses = useMenuItemStyles({open})

  // Root element must have a `tabIndex` attribute for keyboard navigation
  let tabIndex
  if (!props.disabled) {
    tabIndex = tabIndexProp !== undefined ? tabIndexProp : -1
  }

  return (
    <div
      {...ContainerProps}
      ref={containerRef}
      onFocus={handleFocus}
      tabIndex={tabIndex}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <MenuItem
        {...MenuItemProps}
        className={clsx(menuItemClasses.root, className)}
        ref={menuItemRef}
      >
        <ListItemText primary={label} />
        <ListItemIcon className='next-level'>
          {rightIcon}
        </ListItemIcon>
      </MenuItem>
      <Menu
        // Set pointer events to 'none' to prevent the invisible Popover div
        // from capturing events for clicks and hovers
        style={{pointerEvents: 'none'}}
        anchorEl={menuItemRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        anchorPosition={{
          left: -100,
          top: 0
        }}
        open={open}
        autoFocus={false}
        disableAutoFocus
        disableEnforceFocus
        onClose={() => {
          setIsSubMenuOpen(false)
        }}
      >
        <div ref={menuContainerRef} style={{pointerEvents: 'auto'}}>
          {children}
        </div>
      </Menu>
    </div>
  )
})

export default NestedMenuItem