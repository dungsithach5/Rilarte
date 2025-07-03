"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "../ui/drawer"

export default function DrawerChat() {
  const [open, setOpen] = React.useState(false)

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Bell/>
      </DrawerTrigger>
      <DrawerContent>
  
      </DrawerContent>
    </Drawer>
  )
}
