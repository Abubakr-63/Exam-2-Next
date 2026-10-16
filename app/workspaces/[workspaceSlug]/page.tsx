"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  Users,
  Bell,
  Settings,
  Plus,
  Trash2,
  ArrowRight,
  UserPlus,
  Send,
  LogOut,
  CheckCheck,
  Check,
  ShieldAlert,
  Copy,
} from "lucide-react";
import {
  useGetWorkspaceBySlugQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useLeaveWorkspaceMutation,
  useTransferWorkspaceOwnershipMutation,
  useGetWorkspaceMembersQuery,
  useAddWorkspaceMemberMutation,
  useUpdateWorkspaceMemberRoleMutation,
  useRemoveWorkspaceMemberMutation,
  useInviteWorkspaceMemberMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

function WorkspaceContent() {
  const params = useParams<{ workspaceSlug: string }>();
  const workspaceSlug = params.workspaceSlug;
  const router = useRouter();

  const { data: workspace, isLoading: isWsLoading } =
    useGetWorkspaceBySlugQuery(workspaceSlug);

  const { data: projects, isLoading: isProjectsLoading } =
    useGetProjectsQuery(workspaceSlug);
  const [createProject, { isLoading: isCreatingProject }] =
    useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const { data: members } = useGetWorkspaceMembersQuery(workspaceSlug);
  const [addMember] = useAddWorkspaceMemberMutation();
  const [updateMemberRole] = useUpdateWorkspaceMemberRoleMutation();
  const [removeMember] = useRemoveWorkspaceMemberMutation();
  const [inviteMember] = useInviteWorkspaceMemberMutation();

  const [notifFilter, setNotifFilter] = useState<"" | "true" | "false">("");
  const { data: notificationsData } = useGetNotificationsQuery({
    workspaceSlug,
    read: notifFilter === "" ? undefined : notifFilter,
  });
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [markOneRead] = useMarkNotificationReadMutation();

  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const [deleteWorkspace] = useDeleteWorkspaceMutation();
  const [leaveWorkspace] = useLeaveWorkspaceMutation();
  const [transferOwnership] = useTransferWorkspaceOwnershipMutation();

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projName, setProjName] = useState("");
  const [projIdentifier, setProjIdentifier] = useState("");
  const [projDescription, setProjDescription] = useState("");

  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<
    "admin" | "member" | "guest"
  >("member");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "guest">(
    "member"
  );
  const [createdInviteToken, setCreatedInviteToken] = useState("");

  const [editWsName, setEditWsName] = useState("");
  const [editWsSlug, setEditWsSlug] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (workspace) {
      setEditWsName(workspace.name);
      setEditWsSlug(workspace.slug);
    }
  }, [workspace]);

  const handleProjNameChange = (val: string) => {
    setProjName(val);
    const code = val
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 5);
    setProjIdentifier(code || "TODO");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("");
    try {
      await createProject({
        workspaceSlug,
        name: projName,
        identifier: projIdentifier.toUpperCase(),
        description: projDescription || undefined,
      }).unwrap();
      setProjName("");
      setProjIdentifier("");
      setProjDescription("");
      setShowCreateProject(false);
      setStatusMsg("Проект успешно создан!");
    } catch (err: any) {
      setStatusMsg(err?.data?.message || "Не удалось создать проект.");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMember({
        workspaceSlug,
        user_id: newMemberUserId,
        role: newMemberRole,
      }).unwrap();
      setNewMemberUserId("");
      setStatusMsg("Участник добавлен в команду!");
    } catch (err: any) {
      setStatusMsg(err?.data?.message || "Не удалось добавить участника.");
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await inviteMember({
        workspaceSlug,
        email: inviteEmail,
        role: inviteRole,
      }).unwrap();
      setInviteEmail("");
      setCreatedInviteToken(res.token || "");
      setStatusMsg("Приглашение создано!");
    } catch (err: any) {
      setStatusMsg(err?.data?.message || "Не удалось отправить приглашение.");
    }
  };

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateWorkspace({
        workspaceSlug,
        name: editWsName,
        slug: editWsSlug,
      }).unwrap();
      setStatusMsg("Настройки сохранены!");
      if (updated.slug && updated.slug !== workspaceSlug) {
        router.push(`/workspaces/${updated.slug}`);
      }
    } catch (err: any) {
      setStatusMsg(err?.data?.message || "Ошибка обновления пространства.");
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transferOwnership({
        workspaceSlug,
        user_id: newOwnerId,
      }).unwrap();
      setNewOwnerId("");
      setStatusMsg("Права владельца переданы!");
    } catch (err: any) {
      setStatusMsg(err?.data?.message || "Ошибка передачи прав.");
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!confirm("Покинуть это рабочее пространство?")) return;
    try {
      await leaveWorkspace(workspaceSlug).unwrap();
      router.push("/");
    } catch (err: any) {
      setStatusMsg(
        err?.data?.message || "Владелец не может покинуть своё пространство."
      );
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!confirm("Удалить рабочее пространство безвозвратно?")) return;
    try {
      await deleteWorkspace(workspaceSlug).unwrap();
      router.push("/");
    } catch (err: any) {
      setStatusMsg(err?.data?.message || "Ошибка при удалении пространства.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {/* Шапка рабочего пространства */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-[#16161b] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-base font-bold text-blue-400 uppercase">
            {(workspace?.name || workspaceSlug).slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-100">
                {isWsLoading
                  ? "Загрузка..."
                  : workspace?.name || workspaceSlug}
              </h1>
              <Badge variant="secondary">{workspaceSlug}</Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Управление проектами, участниками команды и уведомлениями
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusMsg && (
            <Badge variant="default" className="py-1 px-3">
              {statusMsg}
            </Badge>
          )}
          <Button onClick={() => setShowCreateProject(!showCreateProject)}>
            <Plus className="h-4 w-4" />
            Новый проект
          </Button>
        </div>
      </div>

      {/* Вкладки разделов */}
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">
            <FolderKanban className="h-3.5 w-3.5" />
            Проекты ({projects?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-3.5 w-3.5" />
            Команда ({members?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5" />
            Уведомления ({notificationsData?.unread_count || 0})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-3.5 w-3.5" />
            Настройки
          </TabsTrigger>
        </TabsList>

        {/* ВКЛАДКА 1: ПРОЕКТЫ */}
        <TabsContent value="projects" className="space-y-6">
          {(showCreateProject || (projects && projects.length === 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-blue-500" />
                  Создать новый проект
                </CardTitle>
                <CardDescription>
                  Укажите название и короткий префикс для номеров задач (например: TODO, WEB, APP)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleCreateProject}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end"
                >
                  <div className="space-y-1.5">
                    <Label>Название проекта</Label>
                    <Input
                      placeholder="Разработка сайта"
                      value={projName}
                      onChange={(e) => handleProjNameChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Префикс задач (A-Z)</Label>
                    <Input
                      placeholder="TODO"
                      maxLength={10}
                      value={projIdentifier}
                      onChange={(e) =>
                        setProjIdentifier(
                          e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Описание</Label>
                    <Input
                      placeholder="Цели и задачи проекта"
                      value={projDescription}
                      onChange={(e) => setProjDescription(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isCreatingProject}>
                    <Plus className="h-4 w-4" />
                    {isCreatingProject ? "Создание..." : "Создать проект"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {isProjectsLoading ? (
            <p className="text-xs text-zinc-400">Загрузка проектов...</p>
          ) : !projects || projects.length === 0 ? (
            <Card className="border-dashed border-zinc-800">
              <CardContent className="py-10 text-center text-xs text-zinc-400">
                Проектов пока нет. Создайте первый проект выше, чтобы перейти к канбан-доске задач!
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((proj) => (
                <Card
                  key={proj.id}
                  className="group flex flex-col justify-between transition-all hover:border-zinc-700"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="mb-2">{proj.identifier}</Badge>
                        <CardTitle>{proj.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Удалить проект «${proj.name}»?`)) {
                            deleteProject({
                              workspaceSlug,
                              projectId: proj.id,
                            });
                          }
                        }}
                        title="Удалить проект"
                      >
                        <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                      </Button>
                    </div>
                    <CardDescription className="mt-1">
                      {proj.description || "Канбан-доска, спринты и задачи проекта"}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link
                      href={`/workspaces/${workspaceSlug}/projects/${proj.id}`}
                      className="w-full"
                    >
                      <Button className="w-full justify-between">
                        <span>Открыть доску задач</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ВКЛАДКА 2: УЧАСТНИКИ И ПРИГЛАШЕНИЯ */}
        <TabsContent value="members" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-400" />
                  Пригласить коллегу по Email
                </CardTitle>
                <CardDescription>
                  Отправьте приглашение для присоединения к вашему пространству
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteMember} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Email сотрудника</Label>
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Роль в команде</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                      value={inviteRole}
                      onChange={(e) =>
                        setInviteRole(
                          e.target.value as "admin" | "member" | "guest"
                        )
                      }
                    >
                      <option value="member">Участник (member)</option>
                      <option value="admin">Администратор (admin)</option>
                      <option value="guest">Гость (guest)</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Создать приглашение
                  </Button>
                </form>
                {createdInviteToken && (
                  <div className="mt-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-300">
                        Код приглашения готов:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard?.writeText(createdInviteToken)
                        }
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        <Copy className="h-3 w-3" /> Копировать
                      </button>
                    </div>
                    <code className="mt-1 block break-all text-zinc-200">
                      {createdInviteToken}
                    </code>
                    <div className="mt-2">
                      <Link
                        href={`/invites/${createdInviteToken}`}
                        className="underline text-blue-400"
                      >
                        Открыть страницу приглашения →
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-emerald-400" />
                  Добавить зарегистрированного пользователя
                </CardTitle>
                <CardDescription>
                  Быстрое добавление участника по его ID
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMember} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>ID пользователя</Label>
                    <Input
                      placeholder="Введите ID пользователя..."
                      value={newMemberUserId}
                      onChange={(e) => setNewMemberUserId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Роль</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                      value={newMemberRole}
                      onChange={(e) =>
                        setNewMemberRole(
                          e.target.value as "admin" | "member" | "guest"
                        )
                      }
                    >
                      <option value="member">Участник (member)</option>
                      <option value="admin">Администратор (admin)</option>
                      <option value="guest">Гость (guest)</option>
                    </select>
                  </div>
                  <Button type="submit" variant="outline" className="w-full">
                    Добавить в команду
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Состав команды</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Управление</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.map((m) => (
                    <TableRow key={m.user_id}>
                      <TableCell className="font-medium">
                        {m.user?.display_name || "Участник"}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {m.user?.email || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {m.user_id}
                      </TableCell>
                      <TableCell>
                        {m.role === "owner" ? (
                          <Badge>Владелец</Badge>
                        ) : (
                          <select
                            className="rounded border border-zinc-800 bg-[#141417] px-2 py-1 text-xs text-zinc-200"
                            value={m.role}
                            onChange={(e) =>
                              updateMemberRole({
                                workspaceSlug,
                                userId: m.user_id,
                                role: e.target.value as
                                  | "admin"
                                  | "member"
                                  | "guest",
                              })
                            }
                          >
                            <option value="admin">admin</option>
                            <option value="member">member</option>
                            <option value="guest">guest</option>
                          </select>
                        )}
                      </TableCell>
                      <TableCell>
                        {m.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeMember({
                                workspaceSlug,
                                userId: m.user_id,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ВКЛАДКА 3: УВЕДОМЛЕНИЯ */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Центр уведомлений (Новых:{" "}
                  {notificationsData?.unread_count || 0})
                </CardTitle>
                <CardDescription>
                  Уведомления о назначенных задачах, упоминаниях и комментариях
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="h-8 rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-200"
                  value={notifFilter}
                  onChange={(e) =>
                    setNotifFilter(e.target.value as "" | "true" | "false")
                  }
                >
                  <option value="">Все уведомления</option>
                  <option value="false">Непрочитанные</option>
                  <option value="true">Прочитанные</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllRead({ workspaceSlug })}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Прочитать все
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {!notificationsData?.data ||
              notificationsData.data.length === 0 ? (
                <p className="py-6 text-center text-xs text-zinc-500">
                  Уведомлений пока нет.
                </p>
              ) : (
                notificationsData.data.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#141417] p-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={n.is_read ? "secondary" : "default"}>
                          {n.type === "issue_assigned"
                            ? "Назначена задача"
                            : n.type === "comment_added"
                            ? "Новый комментарий"
                            : "Упоминание"}
                        </Badge>
                        <span className="font-medium text-zinc-200">
                          {n.actor?.display_name || "Система"}
                        </span>
                      </div>
                      <p className="text-zinc-500 mt-1">
                        {new Date(n.created_at).toLocaleString("ru-RU")}
                      </p>
                    </div>
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          markOneRead({ workspaceSlug, notificationId: n.id })
                        }
                      >
                        <Check className="h-3.5 w-3.5" />
                        Прочитано
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ВКЛАДКА 4: НАСТРОЙКИ */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Основные параметры</CardTitle>
                <CardDescription>
                  Изменение названия и короткого адреса рабочего пространства
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateWorkspace} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Название пространства</Label>
                    <Input
                      value={editWsName}
                      onChange={(e) => setEditWsName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Короткий адрес (Slug)</Label>
                    <Input
                      value={editWsSlug}
                      onChange={(e) => setEditWsSlug(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit">Сохранить изменения</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Передача прав владельца</CardTitle>
                <CardDescription>
                  Назначьте другого участника команды владельцем пространства
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransferOwnership} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>ID нового владельца</Label>
                    <Input
                      placeholder="Введите ID участника..."
                      value={newOwnerId}
                      onChange={(e) => setNewOwnerId(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    Передать права
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="border-red-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="h-4 w-4" />
                Управление доступом и удаление
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleLeaveWorkspace}>
                <LogOut className="h-4 w-4" />
                Покинуть пространство
              </Button>
              <Button variant="destructive" onClick={handleDeleteWorkspace}>
                <Trash2 className="h-4 w-4" />
                Удалить рабочее пространство
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-400">
          Загрузка рабочего пространства...
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
