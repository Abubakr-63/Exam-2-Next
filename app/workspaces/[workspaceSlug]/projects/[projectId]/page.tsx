"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Kanban,
  ListFilter,
  Layers,
  Tag,
  RefreshCw,
  Boxes,
  Users,
  Settings,
  Plus,
  Trash2,
  ArrowLeft,
  Edit3,
  MoreHorizontal,
  Circle,
  CircleDot,
  CheckCircle2,
  XCircle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  AlertOctagon,
  Minus,
  UserPlus,
  X,
  ExternalLink,
  Copy,
  Paperclip,
  GitBranch,
  MessageSquare,
  Activity,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useGetStatesQuery,
  useCreateStateMutation,
  useUpdateStateMutation,
  useDeleteStateMutation,
  useGetLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
  useGetCyclesQuery,
  useGetCycleByIdQuery,
  useCreateCycleMutation,
  useUpdateCycleMutation,
  useDeleteCycleMutation,
  useAddIssuesToCycleMutation,
  useRemoveIssueFromCycleMutation,
  useGetModulesQuery,
  useGetModuleByIdQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useAddIssuesToModuleMutation,
  useRemoveIssueFromModuleMutation,
  useGetIssuesQuery,
  useCreateIssueMutation,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
  useAddIssueAssigneeMutation,
  useRemoveIssueAssigneeMutation,
  useAttachIssueLabelMutation,
  useDetachIssueLabelMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetIssueRelationsQuery,
  useCreateIssueRelationMutation,
  useDeleteIssueRelationMutation,
  useGetIssueAttachmentsQuery,
  useRegisterAttachmentMutation,
  useDeleteAttachmentMutation,
  useUploadInternalStorageMutation,
  useGetIssueActivityQuery,
  useGetWorkspaceMembersQuery,
} from "@/store/api";
import type {
  StateGroup,
  IssuePriority,
  ModuleStatus,
  Issue,
  ProjectState,
  RelationType,
} from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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

// Иконка группы статуса как в Plane (Backlog, Todo, In Progress, Done, Cancelled)
function StateGroupIcon({
  group,
  color,
}: {
  group: StateGroup;
  color?: string;
}) {
  switch (group) {
    case "backlog":
      return (
        <Circle
          className="h-3.5 w-3.5 shrink-0 opacity-70"
          style={{ color: color || "#a1a1aa", strokeDasharray: "2 2" }}
        />
      );
    case "unstarted":
      return (
        <Circle
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: color || "#d4d4d8" }}
        />
      );
    case "started":
      return (
        <CircleDot
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: color || "#f59e0b" }}
        />
      );
    case "completed":
      return (
        <CheckCircle2
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: color || "#10b981" }}
        />
      );
    case "cancelled":
      return (
        <XCircle
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: color || "#ef4444" }}
        />
      );
    default:
      return <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-400" />;
  }
}

// Иконка и цвет приоритета как в Plane
function PriorityBadgeIcon({ priority }: { priority: IssuePriority }) {
  switch (priority) {
    case "urgent":
      return <AlertOctagon className="h-3.5 w-3.5 text-red-500 shrink-0" />;
    case "high":
      return <SignalHigh className="h-3.5 w-3.5 text-orange-400 shrink-0" />;
    case "medium":
      return <SignalMedium className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    case "low":
      return <SignalLow className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    default:
      return <Minus className="h-3.5 w-3.5 text-zinc-500 shrink-0" />;
  }
}

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
};

// ============================================================================
// ПРАВАЯ БОКОВАЯ ПАНЕЛЬ ЗАДАЧИ (КАК В PLANE НА ВИДЕО)
// ============================================================================
function IssueSlideOverDrawer({
  issue,
  projectIdentifier,
  workspaceSlug,
  projectId,
  states,
  labels,
  cycles,
  modules,
  workspaceMembers,
  allIssues,
  onClose,
  onNotify,
}: {
  issue: Issue;
  projectIdentifier: string;
  workspaceSlug: string;
  projectId: string;
  states: ProjectState[];
  labels: any[];
  cycles: any[];
  modules: any[];
  workspaceMembers: any[];
  allIssues: Issue[];
  onClose: () => void;
  onNotify: (msg: string) => void;
}) {
  const [updateIssue] = useUpdateIssueMutation();
  const [deleteIssue] = useDeleteIssueMutation();
  const [addAssignee] = useAddIssueAssigneeMutation();
  const [removeAssignee] = useRemoveIssueAssigneeMutation();
  const [attachLabel] = useAttachIssueLabelMutation();
  const [detachLabel] = useDetachIssueLabelMutation();
  const [addIssuesToCycle] = useAddIssuesToCycleMutation();
  const [addIssuesToModule] = useAddIssuesToModuleMutation();

  // Комментарии, связи, вложения, активность
  const { data: comments } = useGetCommentsQuery({
    workspaceSlug,
    projectId,
    issueId: issue.id,
  });
  const [createComment] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const { data: relations } = useGetIssueRelationsQuery({
    workspaceSlug,
    projectId,
    issueId: issue.id,
  });
  const [createRelation] = useCreateIssueRelationMutation();
  const [deleteRelation] = useDeleteIssueRelationMutation();

  const { data: attachments } = useGetIssueAttachmentsQuery({
    workspaceSlug,
    projectId,
    issueId: issue.id,
  });
  const [registerAttachment] = useRegisterAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();
  const [uploadStorage] = useUploadInternalStorageMutation();

  const { data: activity } = useGetIssueActivityQuery({
    workspaceSlug,
    projectId,
    issueId: issue.id,
  });

  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || "");
  const [commentText, setCommentText] = useState("");
  const [relatedIssueId, setRelatedIssueId] = useState("");
  const [relationType, setRelationType] = useState<RelationType>("relates_to");

  useEffect(() => {
    setTitle(issue.title);
    setDescription(issue.description || "");
  }, [issue]);

  const handleSaveText = async () => {
    if (title === issue.title && description === (issue.description || "")) {
      return;
    }
    await updateIssue({
      workspaceSlug,
      projectId,
      issueId: issue.id,
      title,
      description: description || null,
    });
    onNotify("Изменения сохранены");
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const reg = await registerAttachment({
        workspaceSlug,
        projectId,
        issueId: issue.id,
        file_name: file.name,
        file_size: file.size || 1,
        mime_type: file.type || "application/octet-stream",
      }).unwrap();

      await uploadStorage({
        path: reg.attachment.storage_key,
        body: file,
        contentType: file.type || "application/octet-stream",
      }).unwrap();
      onNotify("Файл прикреплён");
    } catch {
      onNotify("Ошибка загрузки файла");
    }
  };

  const allRelations = [
    ...(relations?.blocks || []),
    ...(relations?.blocked_by || []),
    ...(relations?.relates_to || []),
    ...(relations?.duplicates || []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-[1px]">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Закрыть панель"
      />
      <aside className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-zinc-800 bg-[#141417] text-zinc-100 shadow-2xl overflow-y-auto">
        {/* Верхняя панель Drawer */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800/80 bg-[#141417]/95 px-6 py-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-medium text-zinc-400">
              {projectIdentifier}-{issue.sequence_id}
            </span>
            <Link
              href={`/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issue.id}`}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Открыть полностью</span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(
                  `${window.location.origin}/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issue.id}`
                );
                onNotify("Ссылка скопирована");
              }}
              title="Скопировать ссылку"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (confirm("Удалить задачу?")) {
                  await deleteIssue({
                    workspaceSlug,
                    projectId,
                    issueId: issue.id,
                  });
                  onClose();
                  onNotify("Задача удалена");
                }
              }}
              title="Удалить задачу"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Основное содержимое Drawer (как в Plane на видео) */}
        <div className="p-6 space-y-6">
          {/* Заголовок задачи */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveText}
            className="w-full bg-transparent text-xl font-semibold text-zinc-100 focus:outline-none border-b border-transparent focus:border-zinc-700 pb-1"
            placeholder="Название задачи..."
          />

          {/* Строка быстрых свойств: Статус, Приоритет, Исполнитель, Даты */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-4">
            {/* Статус */}
            <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#1c1c21] px-2.5 py-1 text-xs">
              <StateGroupIcon
                group={
                  states.find((s) => s.id === issue.state_id)?.group ||
                  "unstarted"
                }
                color={states.find((s) => s.id === issue.state_id)?.color}
              />
              <select
                className="bg-transparent text-xs font-medium text-zinc-200 focus:outline-none cursor-pointer"
                value={issue.state_id}
                onChange={(e) =>
                  updateIssue({
                    workspaceSlug,
                    projectId,
                    issueId: issue.id,
                    state_id: e.target.value,
                  })
                }
              >
                {states.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Приоритет */}
            <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#1c1c21] px-2.5 py-1 text-xs">
              <PriorityBadgeIcon priority={issue.priority} />
              <select
                className="bg-transparent text-xs font-medium text-zinc-200 focus:outline-none cursor-pointer"
                value={issue.priority}
                onChange={(e) =>
                  updateIssue({
                    workspaceSlug,
                    projectId,
                    issueId: issue.id,
                    priority: e.target.value as IssuePriority,
                  })
                }
              >
                <option value="urgent" className="bg-zinc-900">
                  Urgent
                </option>
                <option value="high" className="bg-zinc-900">
                  High
                </option>
                <option value="medium" className="bg-zinc-900">
                  Medium
                </option>
                <option value="low" className="bg-zinc-900">
                  Low
                </option>
                <option value="none" className="bg-zinc-900">
                  None
                </option>
              </select>
            </div>

            {/* Дата начала */}
            <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#1c1c21] px-2.5 py-1 text-xs text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Старт:</span>
              <input
                type="date"
                className="bg-transparent text-xs text-zinc-200 focus:outline-none"
                value={issue.start_date ? issue.start_date.slice(0, 10) : ""}
                onChange={(e) =>
                  updateIssue({
                    workspaceSlug,
                    projectId,
                    issueId: issue.id,
                    start_date: e.target.value || null,
                  })
                }
              />
            </div>

            {/* Дедлайн */}
            <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#1c1c21] px-2.5 py-1 text-xs text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Срок:</span>
              <input
                type="date"
                className="bg-transparent text-xs text-zinc-200 focus:outline-none"
                value={issue.due_date ? issue.due_date.slice(0, 10) : ""}
                onChange={(e) =>
                  updateIssue({
                    workspaceSlug,
                    projectId,
                    issueId: issue.id,
                    due_date: e.target.value || null,
                  })
                }
              />
            </div>
          </div>

          {/* Описание задачи */}
          <div className="space-y-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveText}
              placeholder="Добавьте подробное описание задачи..."
              className="min-h-[100px] border-zinc-800/80 bg-[#18181c]"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={handleSaveText}>
                Сохранить текст
              </Button>
            </div>
          </div>

          {/* Блок Properties (как в Plane) */}
          <div className="space-y-4 border-t border-zinc-800/80 pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Свойства (Properties)
            </h4>

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              {/* Исполнители */}
              <div className="rounded-lg border border-zinc-800/80 bg-[#18181c] p-3 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <UserPlus className="h-3.5 w-3.5" /> Исполнители
                  </span>
                </div>
                <select
                  className="w-full rounded border border-zinc-800 bg-[#141417] px-2 py-1 text-xs text-zinc-200"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addAssignee({
                        workspaceSlug,
                        projectId,
                        issueId: issue.id,
                        user_id: e.target.value,
                      });
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">+ Назначить участника...</option>
                  {workspaceMembers.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.user?.display_name || m.user?.email || m.user_id}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {issue.assignees?.map((a: any, i: number) => {
                    const uid = a.user_id || a.id || String(i);
                    return (
                      <Badge key={uid} variant="secondary" className="gap-1">
                        <span>{a.display_name || a.email || uid.slice(0, 8)}</span>
                        <button
                          type="button"
                          onClick={() =>
                            removeAssignee({
                              workspaceSlug,
                              projectId,
                              issueId: issue.id,
                              userId: uid,
                            })
                          }
                          className="text-zinc-400 hover:text-red-400"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Метки (Labels) */}
              <div className="rounded-lg border border-zinc-800/80 bg-[#18181c] p-3 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Метки (Labels)
                  </span>
                </div>
                <select
                  className="w-full rounded border border-zinc-800 bg-[#141417] px-2 py-1 text-xs text-zinc-200"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      attachLabel({
                        workspaceSlug,
                        projectId,
                        issueId: issue.id,
                        label_id: e.target.value,
                      });
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">+ Добавить метку...</option>
                  {labels.map((lb) => (
                    <option key={lb.id} value={lb.id}>
                      {lb.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {issue.labels?.map((l: any, i: number) => {
                    const lid = l.label_id || l.id || String(i);
                    return (
                      <Badge key={lid} variant="outline" className="gap-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: l.color || "#3b82f6" }}
                        />
                        <span>{l.name || lid.slice(0, 6)}</span>
                        <button
                          type="button"
                          onClick={() =>
                            detachLabel({
                              workspaceSlug,
                              projectId,
                              issueId: issue.id,
                              labelId: lid,
                            })
                          }
                          className="text-zinc-400 hover:text-red-400"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Структура проекта: Цикл и Модуль */}
              <div className="rounded-lg border border-zinc-800/80 bg-[#18181c] p-3 space-y-2">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <RefreshCw className="h-3.5 w-3.5" /> Цикл (Cycle)
                </span>
                <select
                  className="w-full rounded border border-zinc-800 bg-[#141417] px-2 py-1 text-xs text-zinc-200"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addIssuesToCycle({
                        workspaceSlug,
                        projectId,
                        cycleId: e.target.value,
                        issue_ids: [issue.id],
                      });
                      onNotify("Задача добавлена в цикл");
                    }
                  }}
                >
                  <option value="">Выбрать цикл...</option>
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-[#18181c] p-3 space-y-2">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Boxes className="h-3.5 w-3.5" /> Модуль (Module)
                </span>
                <select
                  className="w-full rounded border border-zinc-800 bg-[#141417] px-2 py-1 text-xs text-zinc-200"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addIssuesToModule({
                        workspaceSlug,
                        projectId,
                        moduleId: e.target.value,
                        issue_ids: [issue.id],
                      });
                      onNotify("Задача добавлена в модуль");
                    }
                  }}
                >
                  <option value="">Выбрать модуль...</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Связанные задачи (Relations) и Вложения (Attachments) */}
          <div className="grid grid-cols-1 gap-4 border-t border-zinc-800/80 pt-5 sm:grid-cols-2">
            <div className="space-y-2">
              <h5 className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                <GitBranch className="h-3.5 w-3.5 text-purple-400" /> Связи с задачами
              </h5>
              <div className="flex gap-1.5">
                <select
                  className="rounded border border-zinc-800 bg-[#18181c] px-2 py-1 text-xs text-zinc-200"
                  value={relationType}
                  onChange={(e) =>
                    setRelationType(e.target.value as RelationType)
                  }
                >
                  <option value="relates_to">Связана с</option>
                  <option value="blocks">Блокирует</option>
                  <option value="blocked_by">Заблокирована</option>
                  <option value="duplicates">Дублирует</option>
                </select>
                <select
                  className="flex-1 rounded border border-zinc-800 bg-[#18181c] px-2 py-1 text-xs text-zinc-200"
                  value={relatedIssueId}
                  onChange={(e) => setRelatedIssueId(e.target.value)}
                >
                  <option value="">Выберите задачу...</option>
                  {allIssues
                    .filter((i) => i.id !== issue.id)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {projectIdentifier}-{i.sequence_id}: {i.title}
                      </option>
                    ))}
                </select>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!relatedIssueId) return;
                    createRelation({
                      workspaceSlug,
                      projectId,
                      issueId: issue.id,
                      related_issue_id: relatedIssueId,
                      relation_type: relationType,
                    });
                    setRelatedIssueId("");
                  }}
                >
                  +
                </Button>
              </div>
              <div className="space-y-1">
                {allRelations.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded bg-[#18181c] px-2.5 py-1.5 text-xs"
                  >
                    <span>
                      <Badge variant="secondary" className="mr-1.5">
                        {r.relation_type}
                      </Badge>
                      {r.related_issue?.title || r.related_issue_id.slice(0, 8)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        deleteRelation({
                          workspaceSlug,
                          projectId,
                          issueId: issue.id,
                          linkId: r.id,
                        })
                      }
                      className="text-zinc-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                <Paperclip className="h-3.5 w-3.5 text-amber-400" /> Вложения
              </h5>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-700 bg-[#18181c] px-3 py-2 text-xs text-zinc-300 hover:border-blue-500">
                <span>+ Прикрепить файл</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0] || null)
                  }
                />
              </label>
              <div className="space-y-1">
                {attachments?.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded bg-[#18181c] px-2.5 py-1.5 text-xs"
                  >
                    <a
                      href={att.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-blue-400 hover:underline"
                    >
                      {att.file_name}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        deleteAttachment({
                          workspaceSlug,
                          projectId,
                          attachmentId: att.id,
                        })
                      }
                      className="text-zinc-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Комментарии и Активность */}
          <div className="space-y-3 border-t border-zinc-800/80 pt-5">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <MessageSquare className="h-3.5 w-3.5" /> Комментарии (
              {comments?.length || 0})
            </h4>
            <div className="flex gap-2">
              <Input
                placeholder="Написать комментарий..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commentText.trim()) {
                    createComment({
                      workspaceSlug,
                      projectId,
                      issueId: issue.id,
                      body: commentText,
                    });
                    setCommentText("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (!commentText.trim()) return;
                  createComment({
                    workspaceSlug,
                    projectId,
                    issueId: issue.id,
                    body: commentText,
                  });
                  setCommentText("");
                }}
              >
                Отправить
              </Button>
            </div>
            <div className="space-y-2">
              {comments?.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between rounded-lg border border-zinc-800 bg-[#18181c] p-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-300">
                      {c.author?.display_name || "Участник"}
                    </span>
                    <p className="mt-1 text-zinc-200">{c.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      deleteComment({
                        workspaceSlug,
                        projectId,
                        issueId: issue.id,
                        commentId: c.id,
                      })
                    }
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {activity?.data && activity.data.length > 0 && (
              <div className="pt-3 space-y-1.5">
                <h5 className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                  <Activity className="h-3 w-3" /> История изменений
                </h5>
                {activity.data.slice(0, 5).map((act) => (
                  <p key={act.id} className="text-[11px] text-zinc-500">
                    • {act.actor?.display_name || "Пользователь"}: {act.action}{" "}
                    {act.field ? `(${act.field})` : ""}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ПРОЕКТА (КАНБАН-ДОСКА PLANE + РАЗДЕЛЫ)
// ============================================================================
function ProjectDetailContent() {
  const params = useParams<{ workspaceSlug: string; projectId: string }>();
  const { workspaceSlug, projectId } = params;
  const router = useRouter();

  // Toast-уведомление в правом нижнем углу (как в Plane на видео)
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // 1. Проект
  const { data: project } = useGetProjectByIdQuery({
    workspaceSlug,
    projectId,
  });
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [editProjName, setEditProjName] = useState("");
  const [editProjDesc, setEditProjDesc] = useState("");
  const [editProjArchived, setEditProjArchived] = useState(false);

  useEffect(() => {
    if (project) {
      setEditProjName(project.name);
      setEditProjDesc(project.description || "");
      setEditProjArchived(project.is_archived);
    }
  }, [project]);

  // 2. Статусы (колонки канбан-доски)
  const { data: states, isLoading: isStatesLoading } = useGetStatesQuery({
    workspaceSlug,
    projectId,
  });
  const [createState, { isLoading: isCreatingStates }] =
    useCreateStateMutation();
  const [updateState] = useUpdateStateMutation();
  const [deleteState] = useDeleteStateMutation();

  const [stateName, setStateName] = useState("");
  const [stateColor, setStateColor] = useState("#3B82F6");
  const [stateGroup, setStateGroup] = useState<StateGroup>("unstarted");

  // 3. Метки
  const { data: labels } = useGetLabelsQuery({ workspaceSlug, projectId });
  const [createLabel] = useCreateLabelMutation();
  const [updateLabel] = useUpdateLabelMutation();
  const [deleteLabel] = useDeleteLabelMutation();

  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#10B981");

  // 4. Задачи
  const [searchFilter, setSearchFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const { data: issuesResponse, isLoading: isIssuesLoading } =
    useGetIssuesQuery({
      workspaceSlug,
      projectId,
      filters: {
        search: searchFilter || undefined,
        priority: priorityFilter || undefined,
      },
    });
  const [createIssue] = useCreateIssueMutation();
  const [updateIssue] = useUpdateIssueMutation();
  const [deleteIssue] = useDeleteIssueMutation();

  // Состояния для быстрого создания карточки прямо внутри колонки (как на видео)
  const [inlineColumnStateId, setInlineColumnStateId] = useState<string | null>(
    null
  );
  const [inlineTitle, setInlineTitle] = useState("");
  const [openMenuIssueId, setOpenMenuIssueId] = useState<string | null>(null);
  const [selectedDrawerIssueId, setSelectedDrawerIssueId] = useState<
    string | null
  >(null);

  // 5. Циклы
  const { data: cycles } = useGetCyclesQuery({ workspaceSlug, projectId });
  const [createCycle] = useCreateCycleMutation();
  const [updateCycle] = useUpdateCycleMutation();
  const [deleteCycle] = useDeleteCycleMutation();
  const [addIssuesToCycle] = useAddIssuesToCycleMutation();
  const [removeIssueFromCycle] = useRemoveIssueFromCycleMutation();

  const [cycleName, setCycleName] = useState("");
  const [cycleDesc, setCycleDesc] = useState("");
  const [cycleStart, setCycleStart] = useState("");
  const [cycleEnd, setCycleEnd] = useState("");
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [cycleIssueIdInput, setCycleIssueIdInput] = useState("");

  const { data: selectedCycleDetails } = useGetCycleByIdQuery(
    { workspaceSlug, projectId, cycleId: selectedCycleId },
    { skip: !selectedCycleId }
  );

  // 6. Модули
  const { data: modules } = useGetModulesQuery({ workspaceSlug, projectId });
  const [createModule] = useCreateModuleMutation();
  const [updateModule] = useUpdateModuleMutation();
  const [deleteModule] = useDeleteModuleMutation();
  const [addIssuesToModule] = useAddIssuesToModuleMutation();
  const [removeIssueFromModule] = useRemoveIssueFromModuleMutation();

  const [moduleName, setModuleName] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus>("in_progress");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [moduleIssueIdInput, setModuleIssueIdInput] = useState("");

  const { data: selectedModuleDetails } = useGetModuleByIdQuery(
    { workspaceSlug, projectId, moduleId: selectedModuleId },
    { skip: !selectedModuleId }
  );

  // 7. Участники проекта и пространства
  const { data: projectMembers } = useGetProjectMembersQuery({
    workspaceSlug,
    projectId,
  });
  const { data: workspaceMembers } = useGetWorkspaceMembersQuery(workspaceSlug);
  const [addProjectMember] = useAddProjectMemberMutation();
  const [removeProjectMember] = useRemoveProjectMemberMutation();

  const [projMemberUserId, setProjMemberUserId] = useState("");
  const [projMemberRole, setProjMemberRole] = useState<
    "admin" | "member" | "viewer"
  >("member");

  const issuesList = issuesResponse?.data || [];
  const projectIdentifier = project?.identifier || "TODO";

  // Создание 5 стандартных колонок Plane одним кликом, если в проекте ещё нет статусов
  const handleCreateDefaultPlaneColumns = async () => {
    const defaults: {
      name: string;
      color: string;
      group: StateGroup;
      order: number;
      is_default?: boolean;
    }[] = [
      { name: "Backlog", color: "#71717A", group: "backlog", order: 0 },
      {
        name: "Todo",
        color: "#E4E4E7",
        group: "unstarted",
        order: 1,
        is_default: true,
      },
      { name: "In Progress", color: "#F59E0B", group: "started", order: 2 },
      { name: "Done", color: "#10B981", group: "completed", order: 3 },
      { name: "Cancelled", color: "#EF4444", group: "cancelled", order: 4 },
    ];

    try {
      for (const col of defaults) {
        await createState({
          workspaceSlug,
          projectId,
          ...col,
        }).unwrap();
      }
      showToast("Стандартные колонки Plane созданы!");
    } catch {
      showToast("Не удалось создать колонки. Проверьте права доступа.");
    }
  };

  // Быстрое создание задачи прямо в колонке по нажатию Enter (как на видео)
  const handleInlineCreateIssue = async (stateId: string) => {
    if (!inlineTitle.trim()) return;
    try {
      await createIssue({
        workspaceSlug,
        projectId,
        title: inlineTitle.trim(),
        state_id: stateId,
        priority: "none",
      }).unwrap();
      setInlineTitle("");
      setInlineColumnStateId(null);
      showToast("Задача успешно создана");
    } catch {
      showToast("Ошибка при создании задачи");
    }
  };

  const selectedDrawerIssue = issuesList.find(
    (i) => i.id === selectedDrawerIssueId
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.25rem)] bg-[#111113]">
      {/* Верхняя панель проекта */}
      <div className="border-b border-zinc-800/80 bg-[#141417] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/workspaces/${workspaceSlug}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Проекты
              </Button>
            </Link>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <Badge>{projectIdentifier}</Badge>
            <h1 className="text-base font-semibold text-zinc-100">
              {project?.name || "Проект"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Поиск задач..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="h-8 w-48 text-xs"
            />
            <select
              className="h-8 rounded-md border border-zinc-800 bg-[#18181c] px-2.5 text-xs text-zinc-200"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">Все приоритеты</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Основная область с вкладками */}
      <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-4 sm:px-6">
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">
              <Kanban className="h-3.5 w-3.5" />
              Доска (Kanban)
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListFilter className="h-3.5 w-3.5" />
              Список ({issuesList.length})
            </TabsTrigger>
            <TabsTrigger value="cycles">
              <RefreshCw className="h-3.5 w-3.5" />
              Циклы ({cycles?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="modules">
              <Boxes className="h-3.5 w-3.5" />
              Модули ({modules?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="states-labels">
              <Layers className="h-3.5 w-3.5" />
              Статусы и метки
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-3.5 w-3.5" />
              Участники ({projectMembers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-3.5 w-3.5" />
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* ============================================================== */}
          {/* ВКЛАДКА 1: КАНБАН-ДОСКА (ТОЧНО КАК В PLANE НА ВИДЕО)           */}
          {/* ============================================================== */}
          <TabsContent value="board" className="mt-4">
            {isStatesLoading || isIssuesLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="h-[520px] w-80 shrink-0 animate-pulse rounded-xl border border-zinc-800/80 bg-[#16161a]"
                  />
                ))}
              </div>
            ) : !states || states.length === 0 ? (
              <Card className="border-dashed border-zinc-800 bg-[#141418] max-w-xl mx-auto my-12">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                  <h3 className="text-base font-semibold text-zinc-100">
                    Создайте колонки для Канбан-доски
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Нажмите кнопку ниже, чтобы автоматически создать 5 стандартных
                    колонок Plane: Backlog, Todo, In Progress, Done и Cancelled.
                  </p>
                  <Button
                    onClick={handleCreateDefaultPlaneColumns}
                    disabled={isCreatingStates}
                  >
                    <Plus className="h-4 w-4" />
                    {isCreatingStates
                      ? "Создание колонок..."
                      : "Создать стандартные колонки Plane"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-6 items-start">
                {[...states]
                  .sort((a, b) => a.order - b.order)
                  .map((colState) => {
                    const colIssues = issuesList.filter(
                      (iss) => iss.state_id === colState.id
                    );

                    return (
                      <div
                        key={colState.id}
                        className="flex w-[315px] shrink-0 flex-col rounded-xl border border-zinc-800/60 bg-[#141417]/80 p-2.5"
                      >
                        {/* Заголовок колонки (как в Plane) */}
                        <div className="mb-2.5 flex items-center justify-between px-1.5 py-1">
                          <div className="flex items-center gap-2">
                            <StateGroupIcon
                              group={colState.group}
                              color={colState.color}
                            />
                            <span className="text-xs font-semibold text-zinc-200">
                              {colState.name}
                            </span>
                            <span className="text-xs font-medium text-zinc-500">
                              {colIssues.length}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setInlineColumnStateId(colState.id);
                              setInlineTitle("");
                            }}
                            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                            title="Добавить задачу"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Список карточек в колонке */}
                        <div className="space-y-2">
                          {colIssues.map((issue) => (
                            <div
                              key={issue.id}
                              onClick={() => setSelectedDrawerIssueId(issue.id)}
                              className="group relative cursor-pointer rounded-lg border border-zinc-800/90 bg-[#1b1b20] p-3.5 shadow-xs transition-all hover:border-zinc-700 hover:bg-[#202026]"
                            >
                              {/* Верхняя строка карточки: TODO-1 и меню ... */}
                              <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
                                <span>
                                  {projectIdentifier}-{issue.sequence_id}
                                </span>
                                <div
                                  className="relative"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenMenuIssueId(
                                        openMenuIssueId === issue.id
                                          ? null
                                          : issue.id
                                      )
                                    }
                                    className="rounded p-1 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 hover:text-zinc-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </button>

                                  {/* Выпадающее меню карточки (Edit, Open in new tab, Copy link, Delete) */}
                                  {openMenuIssueId === issue.id && (
                                    <div className="absolute right-0 top-6 z-30 w-44 rounded-lg border border-zinc-800 bg-[#18181d] p-1 shadow-xl text-xs">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuIssueId(null);
                                          setSelectedDrawerIssueId(issue.id);
                                        }}
                                        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-zinc-200 hover:bg-zinc-800"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        Редактировать
                                      </button>
                                      <Link
                                        href={`/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issue.id}`}
                                        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-zinc-200 hover:bg-zinc-800"
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Открыть страницу
                                      </Link>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard?.writeText(
                                            `${window.location.origin}/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issue.id}`
                                          );
                                          setOpenMenuIssueId(null);
                                          showToast("Ссылка скопирована");
                                        }}
                                        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-zinc-200 hover:bg-zinc-800"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        Скопировать ссылку
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          setOpenMenuIssueId(null);
                                          await deleteIssue({
                                            workspaceSlug,
                                            projectId,
                                            issueId: issue.id,
                                          });
                                          showToast("Задача удалена");
                                        }}
                                        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-red-400 hover:bg-red-500/10"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Удалить
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Заголовок карточки */}
                              <p className="mt-1.5 text-sm font-medium text-zinc-100 leading-snug">
                                {issue.title}
                              </p>

                              {/* Нижние плашки карточки (Статус, Приоритет, Исполнители) как в Plane */}
                              <div
                                className="mt-3 flex flex-wrap items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Быстрая смена статуса прямо на карточке */}
                                <div className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-[#141418] px-2 py-0.5 text-[11px] text-zinc-300 hover:border-zinc-700">
                                  <StateGroupIcon
                                    group={colState.group}
                                    color={colState.color}
                                  />
                                  <select
                                    value={issue.state_id}
                                    onChange={(e) =>
                                      updateIssue({
                                        workspaceSlug,
                                        projectId,
                                        issueId: issue.id,
                                        state_id: e.target.value,
                                      })
                                    }
                                    className="bg-transparent text-[11px] text-zinc-300 focus:outline-none cursor-pointer"
                                  >
                                    {states.map((st) => (
                                      <option
                                        key={st.id}
                                        value={st.id}
                                        className="bg-zinc-900"
                                      >
                                        {st.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Быстрая смена приоритета прямо на карточке */}
                                <div className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-[#141418] px-2 py-0.5 text-[11px] text-zinc-300 hover:border-zinc-700">
                                  <PriorityBadgeIcon
                                    priority={issue.priority}
                                  />
                                  <select
                                    value={issue.priority}
                                    onChange={(e) =>
                                      updateIssue({
                                        workspaceSlug,
                                        projectId,
                                        issueId: issue.id,
                                        priority: e.target
                                          .value as IssuePriority,
                                      })
                                    }
                                    className="bg-transparent text-[11px] text-zinc-300 focus:outline-none cursor-pointer"
                                  >
                                    {(
                                      [
                                        "urgent",
                                        "high",
                                        "medium",
                                        "low",
                                        "none",
                                      ] as IssuePriority[]
                                    ).map((p) => (
                                      <option
                                        key={p}
                                        value={p}
                                        className="bg-zinc-900"
                                      >
                                        {PRIORITY_LABELS[p]}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Иконка исполнителей */}
                                <span
                                  className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-[#141418] px-1.5 py-0.5 text-[11px] text-zinc-400"
                                  title="Исполнители"
                                >
                                  <UserPlus className="h-3 w-3" />
                                  {issue.assignees?.length || 0}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Инлайн-карточка быстрого создания (как на видео: Work item title -> Press 'Enter') */}
                          {inlineColumnStateId === colState.id ? (
                            <div className="rounded-lg border border-blue-500/50 bg-[#1b1b20] p-3 space-y-2">
                              <span className="text-[11px] font-mono text-zinc-400">
                                {projectIdentifier}
                              </span>
                              <input
                                autoFocus
                                value={inlineTitle}
                                onChange={(e) => setInlineTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleInlineCreateIssue(colState.id);
                                  } else if (e.key === "Escape") {
                                    setInlineColumnStateId(null);
                                  }
                                }}
                                placeholder="Название задачи..."
                                className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                              />
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] italic text-zinc-500">
                                  Нажмите «Enter» для создания
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setInlineColumnStateId(null)}
                                  >
                                    Отмена
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleInlineCreateIssue(colState.id)
                                    }
                                  >
                                    Добавить
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setInlineColumnStateId(colState.id);
                                setInlineTitle("");
                              }}
                              className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Новая задача</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          {/* ============================================================== */}
          {/* ВКЛАДКА 2: ТАБЛИЧНЫЙ СПИСОК ЗАДАЧ                              */}
          {/* ============================================================== */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Все задачи проекта</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Код</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Приоритет</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuesList.map((iss) => (
                      <TableRow key={iss.id}>
                        <TableCell className="font-mono text-xs text-zinc-400">
                          {projectIdentifier}-{iss.sequence_id}
                        </TableCell>
                        <TableCell
                          className="font-medium cursor-pointer hover:text-blue-400"
                          onClick={() => setSelectedDrawerIssueId(iss.id)}
                        >
                          {iss.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {states?.find((s) => s.id === iss.state_id)?.name ||
                              "Статус"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs">
                            <PriorityBadgeIcon priority={iss.priority} />
                            <span>{PRIORITY_LABELS[iss.priority]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDrawerIssueId(iss.id)}
                          >
                            Открыть
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteIssue({
                                workspaceSlug,
                                projectId,
                                issueId: iss.id,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================== */}
          {/* ВКЛАДКА 3: ЦИКЛЫ / СПРИНТЫ (CYCLES)                            */}
          {/* ============================================================== */}
          <TabsContent value="cycles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Создать новый цикл (Спринт)</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await createCycle({
                      workspaceSlug,
                      projectId,
                      name: cycleName,
                      description: cycleDesc || null,
                      start_date: cycleStart || null,
                      end_date: cycleEnd || null,
                    });
                    setCycleName("");
                    setCycleDesc("");
                    showToast("Цикл создан");
                  }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-5 items-end"
                >
                  <div className="space-y-1.5">
                    <Label>Название спринта</Label>
                    <Input
                      placeholder="Спринт 1"
                      value={cycleName}
                      onChange={(e) => setCycleName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Цель</Label>
                    <Input
                      placeholder="Основные задачи"
                      value={cycleDesc}
                      onChange={(e) => setCycleDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Дата начала</Label>
                    <Input
                      type="date"
                      value={cycleStart}
                      onChange={(e) => setCycleStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Дата окончания</Label>
                    <Input
                      type="date"
                      value={cycleEnd}
                      onChange={(e) => setCycleEnd(e.target.value)}
                    />
                  </div>
                  <Button type="submit">
                    <Plus className="h-4 w-4" />
                    Создать цикл
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Список циклов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Период</TableHead>
                      <TableHead>Управление</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cycles?.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400">
                          {c.start_date || "—"} → {c.end_date || "—"}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCycleId(c.id)}
                          >
                            Прогресс и задачи
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const nextName = prompt(
                                "Новое название цикла:",
                                c.name
                              );
                              if (nextName) {
                                updateCycle({
                                  workspaceSlug,
                                  projectId,
                                  cycleId: c.id,
                                  name: nextName,
                                });
                              }
                            }}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteCycle({
                                workspaceSlug,
                                projectId,
                                cycleId: c.id,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {selectedCycleId && selectedCycleDetails && (
                  <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4 space-y-3">
                    <h4 className="text-sm font-semibold">
                      Прогресс цикла: {selectedCycleDetails.name}
                    </h4>
                    {selectedCycleDetails.progress && (
                      <p className="text-xs text-zinc-400">
                        Всего задач: {selectedCycleDetails.progress.total} •
                        Завершено: {selectedCycleDetails.progress.completed} (
                        {selectedCycleDetails.progress.completion_percentage}%)
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
                        className="h-9 rounded-md border border-zinc-800 bg-[#18181c] px-3 text-xs text-zinc-200"
                        value={cycleIssueIdInput}
                        onChange={(e) => setCycleIssueIdInput(e.target.value)}
                      >
                        <option value="">Выберите задачу...</option>
                        {issuesList.map((i) => (
                          <option key={i.id} value={i.id}>
                            {projectIdentifier}-{i.sequence_id}: {i.title}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!cycleIssueIdInput) return;
                          addIssuesToCycle({
                            workspaceSlug,
                            projectId,
                            cycleId: selectedCycleId,
                            issue_ids: [cycleIssueIdInput],
                          });
                          showToast("Задача добавлена в цикл");
                        }}
                      >
                        Добавить в цикл
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (!cycleIssueIdInput) return;
                          removeIssueFromCycle({
                            workspaceSlug,
                            projectId,
                            cycleId: selectedCycleId,
                            issueId: cycleIssueIdInput,
                          });
                          showToast("Задача убрана из цикла");
                        }}
                      >
                        Убрать из цикла
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================== */}
          {/* ВКЛАДКА 4: МОДУЛИ (MODULES)                                    */}
          {/* ============================================================== */}
          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Создать модуль проекта</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await createModule({
                      workspaceSlug,
                      projectId,
                      name: moduleName,
                      description: moduleDesc || null,
                      status: moduleStatus,
                    });
                    setModuleName("");
                    setModuleDesc("");
                    showToast("Модуль создан");
                  }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end"
                >
                  <div className="space-y-1.5">
                    <Label>Название модуля</Label>
                    <Input
                      placeholder="Авторизация"
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Описание</Label>
                    <Input
                      placeholder="Описание функционала"
                      value={moduleDesc}
                      onChange={(e) => setModuleDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Статус</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                      value={moduleStatus}
                      onChange={(e) =>
                        setModuleStatus(e.target.value as ModuleStatus)
                      }
                    >
                      <option value="backlog">backlog</option>
                      <option value="in_progress">in_progress</option>
                      <option value="paused">paused</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                  <Button type="submit">
                    <Plus className="h-4 w-4" />
                    Создать модуль
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Список модулей</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Управление</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules?.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{m.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400">
                          {m.description || "—"}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedModuleId(m.id)}
                          >
                            Прогресс и задачи
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const nextName = prompt(
                                "Новое название модуля:",
                                m.name
                              );
                              if (nextName) {
                                updateModule({
                                  workspaceSlug,
                                  projectId,
                                  moduleId: m.id,
                                  name: nextName,
                                });
                              }
                            }}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteModule({
                                workspaceSlug,
                                projectId,
                                moduleId: m.id,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {selectedModuleId && selectedModuleDetails && (
                  <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4 space-y-3">
                    <h4 className="text-sm font-semibold">
                      Модуль: {selectedModuleDetails.name}
                    </h4>
                    {selectedModuleDetails.progress && (
                      <p className="text-xs text-zinc-400">
                        Всего задач: {selectedModuleDetails.progress.total} •
                        Завершено: {selectedModuleDetails.progress.completed} (
                        {selectedModuleDetails.progress.completion_percentage}%)
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
                        className="h-9 rounded-md border border-zinc-800 bg-[#18181c] px-3 text-xs text-zinc-200"
                        value={moduleIssueIdInput}
                        onChange={(e) => setModuleIssueIdInput(e.target.value)}
                      >
                        <option value="">Выберите задачу...</option>
                        {issuesList.map((i) => (
                          <option key={i.id} value={i.id}>
                            {projectIdentifier}-{i.sequence_id}: {i.title}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!moduleIssueIdInput) return;
                          addIssuesToModule({
                            workspaceSlug,
                            projectId,
                            moduleId: selectedModuleId,
                            issue_ids: [moduleIssueIdInput],
                          });
                          showToast("Задача добавлена в модуль");
                        }}
                      >
                        Добавить в модуль
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (!moduleIssueIdInput) return;
                          removeIssueFromModule({
                            workspaceSlug,
                            projectId,
                            moduleId: selectedModuleId,
                            issueId: moduleIssueIdInput,
                          });
                          showToast("Задача убрана из модуля");
                        }}
                      >
                        Убрать из модуля
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================== */}
          {/* ВКЛАДКА 5: СТАТУСЫ И МЕТКИ                                     */}
          {/* ============================================================== */}
          <TabsContent value="states-labels" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Колонки / Статусы */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Колонки доски (Статусы)</CardTitle>
                    <CardDescription>
                      Настройте этапы выполнения задач
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateDefaultPlaneColumns}
                  >
                    + Стандартные колонки
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await createState({
                        workspaceSlug,
                        projectId,
                        name: stateName,
                        color: stateColor,
                        group: stateGroup,
                      });
                      setStateName("");
                      showToast("Статус добавлен");
                    }}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-4 items-end"
                  >
                    <Input
                      placeholder="Название (Todo)"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      required
                    />
                    <Input
                      type="color"
                      value={stateColor}
                      onChange={(e) => setStateColor(e.target.value)}
                      className="h-9 p-1"
                    />
                    <select
                      className="h-9 rounded-md border border-zinc-800 bg-[#141417] px-2 text-xs text-zinc-100"
                      value={stateGroup}
                      onChange={(e) =>
                        setStateGroup(e.target.value as StateGroup)
                      }
                    >
                      <option value="backlog">backlog</option>
                      <option value="unstarted">unstarted</option>
                      <option value="started">started</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                    <Button type="submit">Добавить</Button>
                  </form>

                  <div className="space-y-1.5">
                    {states?.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#141417] px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <StateGroupIcon group={st.group} color={st.color} />
                          <span className="font-medium">{st.name}</span>
                          <Badge variant="secondary">{st.group}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const nextName = prompt(
                                "Новое название статуса:",
                                st.name
                              );
                              if (nextName) {
                                updateState({
                                  workspaceSlug,
                                  projectId,
                                  stateId: st.id,
                                  name: nextName,
                                });
                              }
                            }}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteState({
                                workspaceSlug,
                                projectId,
                                stateId: st.id,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Метки проекта */}
              <Card>
                <CardHeader>
                  <CardTitle>Метки задач (Labels)</CardTitle>
                  <CardDescription>
                    Цветовые теги для категоризации задач
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await createLabel({
                        workspaceSlug,
                        projectId,
                        name: labelName,
                        color: labelColor,
                      });
                      setLabelName("");
                      showToast("Метка создана");
                    }}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-3 items-end"
                  >
                    <Input
                      placeholder="Bug / Feature"
                      value={labelName}
                      onChange={(e) => setLabelName(e.target.value)}
                      required
                    />
                    <Input
                      type="color"
                      value={labelColor}
                      onChange={(e) => setLabelColor(e.target.value)}
                      className="h-9 p-1"
                    />
                    <Button type="submit">Создать метку</Button>
                  </form>

                  <div className="space-y-1.5">
                    {labels?.map((lb) => (
                      <div
                        key={lb.id}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#141417] px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: lb.color }}
                          />
                          <span className="font-medium">{lb.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const nextName = prompt(
                                "Новое название метки:",
                                lb.name
                              );
                              if (nextName) {
                                updateLabel({
                                  workspaceSlug,
                                  projectId,
                                  labelId: lb.id,
                                  name: nextName,
                                });
                              }
                            }}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteLabel({
                                workspaceSlug,
                                projectId,
                                labelId: lb.id,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* ВКЛАДКА 6: УЧАСТНИКИ ПРОЕКТА                                   */}
          {/* ============================================================== */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Добавить участника в проект</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await addProjectMember({
                      workspaceSlug,
                      projectId,
                      user_id: projMemberUserId,
                      role: projMemberRole,
                    });
                    setProjMemberUserId("");
                    showToast("Участник добавлен в проект");
                  }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end"
                >
                  <div className="space-y-1.5">
                    <Label>Участник пространства</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                      value={projMemberUserId}
                      onChange={(e) => setProjMemberUserId(e.target.value)}
                      required
                    >
                      <option value="">Выберите сотрудника...</option>
                      {workspaceMembers?.map((wm) => (
                        <option key={wm.user_id} value={wm.user_id}>
                          {wm.user?.display_name || wm.user?.email || wm.user_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Роль в проекте</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                      value={projMemberRole}
                      onChange={(e) =>
                        setProjMemberRole(
                          e.target.value as "admin" | "member" | "viewer"
                        )
                      }
                    >
                      <option value="member">Участник (member)</option>
                      <option value="admin">Администратор (admin)</option>
                      <option value="viewer">Наблюдатель (viewer)</option>
                    </select>
                  </div>
                  <Button type="submit">Добавить</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Команда проекта</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Удалить</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectMembers?.map((pm) => (
                      <TableRow key={pm.user_id}>
                        <TableCell>
                          {pm.user?.display_name || "Сотрудник"}
                        </TableCell>
                        <TableCell className="text-zinc-400">
                          {pm.user?.email || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pm.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              removeProjectMember({
                                workspaceSlug,
                                projectId,
                                userId: pm.user_id,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================== */}
          {/* ВКЛАДКА 7: НАСТРОЙКИ ПРОЕКТА                                   */}
          {/* ============================================================== */}
          <TabsContent value="settings">
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Настройки проекта</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await updateProject({
                      workspaceSlug,
                      projectId,
                      name: editProjName,
                      description: editProjDesc || null,
                      is_archived: editProjArchived,
                    });
                    showToast("Настройки проекта сохранены");
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label>Название проекта</Label>
                    <Input
                      value={editProjName}
                      onChange={(e) => setEditProjName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Описание</Label>
                    <Input
                      value={editProjDesc}
                      onChange={(e) => setEditProjDesc(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="arch"
                      type="checkbox"
                      checked={editProjArchived}
                      onChange={(e) => setEditProjArchived(e.target.checked)}
                    />
                    <Label htmlFor="arch">Переместить проект в архив</Label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit">Сохранить</Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={async () => {
                        if (confirm("Удалить проект?")) {
                          await deleteProject({
                            workspaceSlug,
                            projectId,
                          }).unwrap();
                          router.push(`/workspaces/${workspaceSlug}`);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить проект
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Боковая панель задачи (Drawer как в Plane на видео) */}
      {selectedDrawerIssue && (
        <IssueSlideOverDrawer
          issue={selectedDrawerIssue}
          projectIdentifier={projectIdentifier}
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          states={states || []}
          labels={labels || []}
          cycles={cycles || []}
          modules={modules || []}
          workspaceMembers={workspaceMembers || []}
          allIssues={issuesList}
          onClose={() => setSelectedDrawerIssueId(null)}
          onNotify={showToast}
        />
      )}

      {/* Всплывающее уведомление справа внизу (как в Plane на видео) */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#18181d] px-4 py-3 text-xs font-medium text-zinc-100 shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg("")}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-400">
          Загрузка доски проекта...
        </div>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  );
}
