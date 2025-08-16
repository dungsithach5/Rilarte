"use client"

import axios from "axios";
import { useEffect, useState } from "react"
import { AppSidebar } from "../@/components/admin-form/app-sidebar"
import { DataTable } from "../@/components/admin-form/data-table"
import { SiteHeader } from "../@/components/admin-form/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "../@/components/ui-admin/sidebar"

import { getAllReports } from "../services/Api/report"

export default function Page() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reports = await getAllReports()
        const formatted = reports.map((r: any) => ({
          id: r.id,
          post_id: r.post_id,
          image: r.posts.image_url,
          name: r.posts.user_name,
          title: r.posts.title,
          reason: r.reason,
          status: r.resolved ? "Done" : "Report",
          time: new Date(r.createdAt).toLocaleDateString(),
        }))
        setData(formatted)
      } catch (err) {
        console.error("Failed to fetch reports:", err)
      }
    }

    fetchReports()
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
