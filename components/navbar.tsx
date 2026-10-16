"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Mail,
  UserCircle2,
  LogIn,
  Layers,
  Sparkles,
} from "lucide-react";
import { useGetMeQuery, useGetWorkspacesQuery } from "@/store/api";

function NavbarContent() {
  const pathname = usePathname();
  const { data: currentUser, isError } = useGetMeQuery();
  const { data: workspaces } = useGetWorkspacesQuery();

  const firstWorkspaceSlug = workspaces?.[0]?.slug;

  const navLinks = [
    {
      href: "/",
      label: "Пространства",
      icon: LayoutGrid,
      active: pathname === "/" || pathname.startsWith("/workspaces"),
    },
    {
      href: "/invites",
      label: "Приглашения",
      icon: Mail,
      active: pathname.startsWith("/invites"),
    },
    {
      href: "/auth",
      label: "Профиль и вход",
      icon: UserCircle2,
      active: pathname.startsWith("/auth"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#141417]/95 backdrop-blur">
      <div className="mx-auto flex h-13 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-100 hover:opacity-90"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            <span>Plane Workspaces</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    item.active
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {firstWorkspaceSlug && (
              <Link
                href={`/workspaces/${firstWorkspaceSlug}`}
                className="hidden sm:flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/20 ml-2"
              >
                <Sparkles className="h-3 w-3" />
                <span>{workspaces?.[0]?.name}</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && !isError ? (
            <Link
              href="/auth"
              className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200 hover:border-zinc-700"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{currentUser.display_name || currentUser.email}</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Войти в аккаунт</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="h-13 border-b border-zinc-800 bg-[#141417]" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
