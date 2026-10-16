"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  ArrowRight,
  Trash2,
  RefreshCw,
  LogIn,
  Layers,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetMeQuery,
} from "@/store/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function HomeContent() {
  const { data: user, isError: isAuthError } = useGetMeQuery();
  const { data: workspaces, isLoading, refetch } = useGetWorkspacesQuery();

  const [createWorkspace, { isLoading: isCreating }] =
    useCreateWorkspaceMutation();
  const [deleteWorkspace] = useDeleteWorkspaceMutation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");

  const handleNameChange = (value: string) => {
    setName(value);
    const autoSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!name || !slug) return;

    try {
      await createWorkspace({ name, slug }).unwrap();
      setName("");
      setSlug("");
      setShowCreateForm(false);
      setMessage("Рабочее пространство успешно создано!");
    } catch (err: any) {
      setMessage(
        err?.data?.message ||
          "Не удалось создать пространство. Проверьте авторизацию и уникальность адреса."
      );
    }
  };

  const handleDeleteWorkspace = async (workspaceSlug: string) => {
    if (!confirm(`Удалить рабочее пространство «${workspaceSlug}»?`)) return;
    try {
      await deleteWorkspace(workspaceSlug).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || "Удалить пространство может только владелец.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Приветственный баннер */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/90 bg-gradient-to-br from-[#18181f] to-[#121216] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Plane Task Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Добро пожаловать{user && !isAuthError ? `, ${user.display_name}` : ""}!
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Выберите рабочее пространство для работы с проектами, канбан-доской,
            спринтами и модулями или создайте новое пространство для вашей команды.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {(!user || isAuthError) ? (
            <Link href="/auth">
              <Button size="lg">
                <LogIn className="h-4 w-4" />
                Войти или зарегистрироваться
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4" />
              Новое пространство
            </Button>
          )}
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Обновить
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs text-blue-300">
          {message}
        </div>
      )}

      {/* Выпадающая или открытая форма создания пространства */}
      {(showCreateForm || (workspaces && workspaces.length === 0)) && (
        <Card className="border-zinc-800 bg-[#16161b]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-500" />
              Создание рабочего пространства
            </CardTitle>
            <CardDescription>
              Рабочее пространство объединяет проекты и участников вашей команды
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateWorkspace}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end"
            >
              <div className="space-y-1.5">
                <Label>Название компании или команды</Label>
                <Input
                  placeholder="Например: Acme Studio"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Короткий адрес (латиница и дефис)</Label>
                <Input
                  placeholder="acme-studio"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isCreating}>
                  <Plus className="h-4 w-4" />
                  {isCreating ? "Создание..." : "Создать пространство"}
                </Button>
                {showCreateForm && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Отмена
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список рабочих пространств */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-400" />
            Ваши рабочие пространства ({workspaces?.length || 0})
          </h2>
          {!showCreateForm && user && !isAuthError && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Добавить
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50"
              />
            ))}
          </div>
        ) : !workspaces || workspaces.length === 0 ? (
          <Card className="border-dashed border-zinc-800 bg-[#141418]">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">
                У вас пока нет рабочих пространств
              </h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-400">
                {!user || isAuthError
                  ? "Войдите в свой аккаунт или зарегистрируйтесь, чтобы увидеть доступные пространства и проекты."
                  : "Заполните форму выше, чтобы создать своё первое рабочее пространство."}
              </p>
              {(!user || isAuthError) && (
                <Link href="/auth" className="mt-4">
                  <Button>Перейти ко входу</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <Card
                key={ws.id}
                className="group flex flex-col justify-between transition-all hover:border-zinc-700"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/15 border border-blue-500/20 text-sm font-bold text-blue-400 uppercase">
                        {ws.name.slice(0, 2)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{ws.name}</CardTitle>
                        <CardDescription className="mt-0.5">
                          Адрес: <Badge variant="secondary">{ws.slug}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWorkspace(ws.slug)}
                      title="Удалить рабочее пространство"
                    >
                      <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                    </Button>
                  </div>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Link href={`/workspaces/${ws.slug}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-between group-hover:border-blue-500/40 group-hover:bg-blue-600/10 group-hover:text-blue-300"
                    >
                      <span className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4" />
                        Перейти к проектам
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-400">
          Загрузка рабочих пространств...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
