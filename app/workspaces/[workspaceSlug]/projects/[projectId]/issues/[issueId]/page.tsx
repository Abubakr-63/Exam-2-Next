"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  UserPlus,
  Tag,
  MessageSquare,
  GitBranch,
  Activity,
  Paperclip,
  Upload,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import {
  useGetIssueByIdQuery,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
  useAddIssueAssigneeMutation,
  useRemoveIssueAssigneeMutation,
  useAttachIssueLabelMutation,
  useDetachIssueLabelMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetIssueRelationsQuery,
  useCreateIssueRelationMutation,
  useDeleteIssueRelationMutation,
  useGetIssueActivityQuery,
  useGetIssueAttachmentsQuery,
  useRegisterAttachmentMutation,
  useDeleteAttachmentMutation,
  useUploadInternalStorageMutation,
  useLazyGetInternalStorageQuery,
  useGetStatesQuery,
  useGetLabelsQuery,
  useGetWorkspaceMembersQuery,
  useGetIssuesQuery,
} from "@/store/api";
import type { IssuePriority, RelationType } from "@/types/api";
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

function IssueDetailContent() {
  const params = useParams<{
    workspaceSlug: string;
    projectId: string;
    issueId: string;
  }>();
  const { workspaceSlug, projectId, issueId } = params;
  const router = useRouter();
  const [statusMsg, setStatusMsg] = useState("");

  const { data: issue, isLoading } = useGetIssueByIdQuery({
    workspaceSlug,
    projectId,
    issueId,
  });
  const { data: states } = useGetStatesQuery({ workspaceSlug, projectId });
  const { data: projectLabels } = useGetLabelsQuery({
    workspaceSlug,
    projectId,
  });
  const { data: workspaceMembers } = useGetWorkspaceMembersQuery(workspaceSlug);
  const { data: allIssuesData } = useGetIssuesQuery({
    workspaceSlug,
    projectId,
  });

  const [updateIssue] = useUpdateIssueMutation();
  const [deleteIssue] = useDeleteIssueMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [stateId, setStateId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatePoints, setEstimatePoints] = useState("");

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description || "");
      setPriority(issue.priority);
      setStateId(issue.state_id);
      setDueDate(issue.due_date ? issue.due_date.slice(0, 10) : "");
      setEstimatePoints(
        issue.estimate_points !== null ? String(issue.estimate_points) : ""
      );
    }
  }, [issue]);

  const [addAssignee] = useAddIssueAssigneeMutation();
  const [removeAssignee] = useRemoveIssueAssigneeMutation();
  const [attachLabel] = useAttachIssueLabelMutation();
  const [detachLabel] = useDetachIssueLabelMutation();

  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [selectedLabelId, setSelectedLabelId] = useState("");

  const { data: comments } = useGetCommentsQuery({
    workspaceSlug,
    projectId,
    issueId,
  });
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [commentBody, setCommentBody] = useState("");

  const { data: relations } = useGetIssueRelationsQuery({
    workspaceSlug,
    projectId,
    issueId,
  });
  const [createRelation] = useCreateIssueRelationMutation();
  const [deleteRelation] = useDeleteIssueRelationMutation();
  const [relatedIssueId, setRelatedIssueId] = useState("");
  const [relationType, setRelationType] =
    useState<RelationType>("relates_to");

  const { data: activityData } = useGetIssueActivityQuery({
    workspaceSlug,
    projectId,
    issueId,
  });

  const { data: attachments } = useGetIssueAttachmentsQuery({
    workspaceSlug,
    projectId,
    issueId,
  });
  const [registerAttachment] = useRegisterAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();
  const [uploadInternalStorage] = useUploadInternalStorageMutation();
  const [triggerGetStorage] = useLazyGetInternalStorageQuery();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSaveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateIssue({
        workspaceSlug,
        projectId,
        issueId,
        title,
        description: description || null,
        priority,
        state_id: stateId,
        due_date: dueDate || null,
        estimate_points: estimatePoints ? Number(estimatePoints) : null,
      }).unwrap();
      setStatusMsg("Изменения сохранены!");
    } catch (err: any) {
      setStatusMsg(err?.data?.message || "Не удалось обновить задачу.");
    }
  };

  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    try {
      const reg = await registerAttachment({
        workspaceSlug,
        projectId,
        issueId,
        file_name: selectedFile.name,
        file_size: selectedFile.size || 1,
        mime_type: selectedFile.type || "application/octet-stream",
      }).unwrap();

      const key = reg.attachment.storage_key;
      await uploadInternalStorage({
        path: key,
        body: selectedFile,
        contentType: selectedFile.type || "application/octet-stream",
      }).unwrap();

      triggerGetStorage(key);
      setSelectedFile(null);
      setStatusMsg("Файл успешно прикреплён!");
    } catch (err: any) {
      setStatusMsg(err?.data?.message || "Ошибка при загрузке вложения.");
    }
  };

  const allRelations = [
    ...(relations?.blocks || []),
    ...(relations?.blocked_by || []),
    ...(relations?.relates_to || []),
    ...(relations?.duplicates || []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/workspaces/${workspaceSlug}/projects/${projectId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Вернуться на доску проекта
          </Button>
        </Link>
        {statusMsg && (
          <Badge variant="default" className="py-1 px-3">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {statusMsg}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Левая колонка: Заголовок, описание, комментарии, активность */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <Badge variant="secondary" className="mb-1">
                  Задача #{issue?.sequence_id || "—"}
                </Badge>
                <CardTitle className="text-lg">
                  {isLoading ? "Загрузка задачи..." : issue?.title}
                </CardTitle>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (confirm("Удалить эту задачу?")) {
                    await deleteIssue({
                      workspaceSlug,
                      projectId,
                      issueId,
                    }).unwrap();
                    router.push(
                      `/workspaces/${workspaceSlug}/projects/${projectId}`
                    );
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Удалить
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveIssue} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Название задачи</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Подробное описание</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Опишите детали задачи..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label>Статус</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                      value={stateId}
                      onChange={(e) => setStateId(e.target.value)}
                    >
                      {states?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Приоритет</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as IssuePriority)
                      }
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Срок выполнения</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Оценка (Story Points)</Label>
                    <Input
                      type="number"
                      value={estimatePoints}
                      onChange={(e) => setEstimatePoints(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>

                <Button type="submit">
                  <Save className="h-4 w-4" />
                  Сохранить изменения
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Комментарии */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                Обсуждение ({comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Напишите комментарий..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (!commentBody.trim()) return;
                    createComment({
                      workspaceSlug,
                      projectId,
                      issueId,
                      body: commentBody,
                    });
                    setCommentBody("");
                  }}
                >
                  Отправить
                </Button>
              </div>

              <div className="space-y-2.5">
                {comments?.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between rounded-lg border border-zinc-800 bg-[#141417] p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-zinc-300">
                        {c.author?.display_name || "Участник"} •{" "}
                        <span className="font-normal text-zinc-500">
                          {new Date(c.created_at).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-zinc-100">{c.body}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const nextBody = prompt(
                            "Изменить комментарий:",
                            c.body
                          );
                          if (nextBody) {
                            updateComment({
                              workspaceSlug,
                              projectId,
                              issueId,
                              commentId: c.id,
                              body: nextBody,
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
                          deleteComment({
                            workspaceSlug,
                            projectId,
                            issueId,
                            commentId: c.id,
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

          {/* История активности */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-zinc-400" />
                История активности
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!activityData?.data || activityData.data.length === 0 ? (
                <p className="text-xs text-zinc-500">Записей пока нет.</p>
              ) : (
                activityData.data.map((act) => (
                  <div
                    key={act.id}
                    className="border-b border-zinc-800/80 py-2 text-xs last:border-0 text-zinc-300"
                  >
                    <strong>{act.actor?.display_name || "Пользователь"}</strong>{" "}
                    — <Badge variant="outline">{act.action}</Badge>{" "}
                    {act.field && (
                      <span className="text-zinc-400">
                        ({act.field}: {act.old_value || "—"} →{" "}
                        {act.new_value || "—"})
                      </span>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка: Исполнители, Метки, Связи, Вложения */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-400" />
                Исполнители
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                  value={assigneeUserId}
                  onChange={(e) => setAssigneeUserId(e.target.value)}
                >
                  <option value="">Выберите участника...</option>
                  {workspaceMembers?.map((wm) => (
                    <option key={wm.user_id} value={wm.user_id}>
                      {wm.user?.display_name || wm.user?.email || wm.user_id}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => {
                    if (!assigneeUserId) return;
                    addAssignee({
                      workspaceSlug,
                      projectId,
                      issueId,
                      user_id: assigneeUserId,
                    });
                    setAssigneeUserId("");
                  }}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {issue?.assignees?.map((a: any, idx: number) => {
                  const uid = a.user_id || a.id || String(idx);
                  return (
                    <Badge
                      key={uid}
                      variant="secondary"
                      className="flex items-center gap-1.5"
                    >
                      <span>{a.display_name || a.email || uid}</span>
                      <button
                        type="button"
                        className="text-red-400 hover:underline ml-1"
                        onClick={() =>
                          removeAssignee({
                            workspaceSlug,
                            projectId,
                            issueId,
                            userId: uid,
                          })
                        }
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-400" />
                Метки задачи
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                  value={selectedLabelId}
                  onChange={(e) => setSelectedLabelId(e.target.value)}
                >
                  <option value="">Выберите метку...</option>
                  {projectLabels?.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => {
                    if (!selectedLabelId) return;
                    attachLabel({
                      workspaceSlug,
                      projectId,
                      issueId,
                      label_id: selectedLabelId,
                    });
                  }}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {issue?.labels?.map((l: any, idx: number) => {
                  const lid = l.label_id || l.id || String(idx);
                  return (
                    <Badge
                      key={lid}
                      variant="outline"
                      className="flex items-center gap-1.5"
                    >
                      <span>{l.name || lid}</span>
                      <button
                        type="button"
                        className="text-red-400 hover:underline ml-1"
                        onClick={() =>
                          detachLabel({
                            workspaceSlug,
                            projectId,
                            issueId,
                            labelId: lid,
                          })
                        }
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-purple-400" />
                Связи с другими задачами
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                value={relationType}
                onChange={(e) =>
                  setRelationType(e.target.value as RelationType)
                }
              >
                <option value="relates_to">Связана с</option>
                <option value="blocks">Блокирует</option>
                <option value="blocked_by">Заблокирована задачей</option>
                <option value="duplicates">Дублирует</option>
              </select>
              <div className="flex gap-2">
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-800 bg-[#141417] px-3 text-xs text-zinc-100"
                  value={relatedIssueId}
                  onChange={(e) => setRelatedIssueId(e.target.value)}
                >
                  <option value="">Выберите задачу...</option>
                  {allIssuesData?.data
                    ?.filter((i) => i.id !== issueId)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        #{i.sequence_id}: {i.title}
                      </option>
                    ))}
                </select>
                <Button
                  onClick={() => {
                    if (!relatedIssueId) return;
                    createRelation({
                      workspaceSlug,
                      projectId,
                      issueId,
                      related_issue_id: relatedIssueId,
                      relation_type: relationType,
                    });
                    setRelatedIssueId("");
                  }}
                >
                  +
                </Button>
              </div>
              <div className="space-y-1.5">
                {allRelations.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between rounded border border-zinc-800 bg-[#141417] p-2 text-xs"
                  >
                    <div>
                      <Badge variant="secondary" className="mr-1.5">
                        {rel.relation_type}
                      </Badge>
                      <span>
                        {rel.related_issue?.title || rel.related_issue_id}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        deleteRelation({
                          workspaceSlug,
                          projectId,
                          issueId,
                          linkId: rel.id,
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-amber-400" />
                Файлы и вложения
              </CardTitle>
              <CardDescription>
                Прикрепляйте скриншоты и документы к задаче
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleUploadAttachment} className="space-y-2">
                <Input
                  type="file"
                  onChange={(e) =>
                    setSelectedFile(e.target.files?.[0] || null)
                  }
                />
                <Button
                  type="submit"
                  disabled={!selectedFile}
                  className="w-full"
                >
                  <Upload className="h-4 w-4" />
                  Загрузить файл
                </Button>
              </form>

              <div className="space-y-1.5">
                {attachments?.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded border border-zinc-800 bg-[#141417] p-2 text-xs"
                  >
                    <a
                      href={att.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-400 hover:underline truncate"
                    >
                      {att.file_name}
                    </a>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        deleteAttachment({
                          workspaceSlug,
                          projectId,
                          attachmentId: att.id,
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function IssueDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-400">
          Загрузка карточки задачи...
        </div>
      }
    >
      <IssueDetailContent />
    </Suspense>
  );
}
