"use client"

import { useState } from "react";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  redirect("/settings/edit-profile");
}
