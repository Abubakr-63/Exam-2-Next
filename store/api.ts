import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ActivityListResponse,
  Attachment,
  AuthResponse,
  Comment,
  Cycle,
  Issue,
  IssueFilters,
  IssueRelationItem,
  IssueRelationsResponse,
  IssuesListResponse,
  Label,
  Module,
  NotificationItem,
  NotificationsListResponse,
  Project,
  ProjectMember,
  ProjectRole,
  ProjectState,
  RegisterAttachmentResponse,
  RelationType,
  StateGroup,
  User,
  Workspace,
  WorkspaceInvite,
  WorkspaceMember,
} from "@/types/api";

// Базовый URL локального бэкенда из Swagger (кроме /health)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api/v1";

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // Берем токен из localStorage и добавляем в заголовок Authorization
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  // Теги для автоматического обновления данных на странице после добавления/удаления/изменения
  tagTypes: [
    "Auth",
    "Workspaces",
    "WorkspaceMembers",
    "Projects",
    "ProjectMembers",
    "States",
    "Labels",
    "Issues",
    "Comments",
    "Cycles",
    "Modules",
    "Relations",
    "Activity",
    "Attachments",
    "Notifications",
    "Invites",
    "Storage",
  ],
  endpoints: (builder) => ({
    // ========================================================================
    // 1. INTERNAL STORAGE (/internal/storage/{*})
    // ========================================================================

    // PUT /internal/storage/{*} — Загрузка файла во внутреннее хранилище
    uploadInternalStorage: builder.mutation<
      void,
      { path: string; body: Blob | File | ArrayBuffer | string; contentType?: string }
    >({
      query: ({ path, body, contentType }) => ({
        url: `/internal/storage/${path}`,
        method: "PUT",
        body,
        headers: contentType ? { "Content-Type": contentType } : undefined,
      }),
      invalidatesTags: ["Storage", "Attachments"],
    }),

    // GET /internal/storage/{*} — Получение файла из внутреннего хранилища
    getInternalStorage: builder.query<unknown, string>({
      query: (path) => `/internal/storage/${path}`,
      providesTags: ["Storage"],
    }),

    // ========================================================================
    // 2. AUTH (Авторизация и профиль пользователя)
    // ========================================================================

    // POST /auth/register — Регистрация нового пользователя
    register: builder.mutation<
      AuthResponse,
      {
        email: string;
        password: string;
        display_name: string;
        invite_token?: string;
      }
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Workspaces"],
    }),

    // POST /auth/login — Вход по email и паролю
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Workspaces"],
    }),

    // POST /auth/refresh — Обновление токена (refresh_token -> новый access_token)
    refreshToken: builder.mutation<AuthResponse, { refresh_token: string }>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    // POST /auth/logout — Выход из аккаунта (отзыв refresh_token)
    logout: builder.mutation<void, { refresh_token: string }>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    // GET /auth/me — Получение данных текущего пользователя
    getMe: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    // PATCH /auth/me — Обновление имени или аватарки текущего пользователя
    updateMe: builder.mutation<
      User,
      { display_name?: string; avatar_url?: string | null }
    >({
      query: (body) => ({
        url: "/auth/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    // POST /auth/change-password — Смена пароля
    changePassword: builder.mutation<
      void,
      { current_password: string; new_password: string }
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),

    // ========================================================================
    // 3. WORKSPACES (Рабочие пространства и участники)
    // ========================================================================

    // GET /workspaces/ — Список всех рабочих пространств пользователя
    getWorkspaces: builder.query<Workspace[], void>({
      query: () => "/workspaces/",
      providesTags: ["Workspaces"],
    }),

    // POST /workspaces/ — Создание нового рабочего пространства
    createWorkspace: builder.mutation<
      Workspace,
      { name: string; slug: string }
    >({
      query: (body) => ({
        url: "/workspaces/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Workspaces"],
    }),

    // GET /workspaces/{workspaceSlug} — Детали одного рабочего пространства
    getWorkspaceBySlug: builder.query<Workspace, string>({
      query: (workspaceSlug) => `/workspaces/${workspaceSlug}`,
      providesTags: (_res, _err, slug) => [{ type: "Workspaces", id: slug }],
    }),

    // PATCH /workspaces/{workspaceSlug} — Обновление рабочего пространства
    updateWorkspace: builder.mutation<
      Workspace,
      { workspaceSlug: string; name?: string; slug?: string }
    >({
      query: ({ workspaceSlug, ...body }) => ({
        url: `/workspaces/${workspaceSlug}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Workspaces"],
    }),

    // DELETE /workspaces/{workspaceSlug} — Удаление рабочего пространства (только owner)
    deleteWorkspace: builder.mutation<void, string>({
      query: (workspaceSlug) => ({
        url: `/workspaces/${workspaceSlug}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workspaces"],
    }),

    // GET /workspaces/{workspaceSlug}/members — Список участников рабочего пространства
    getWorkspaceMembers: builder.query<WorkspaceMember[], string>({
      query: (workspaceSlug) => `/workspaces/${workspaceSlug}/members`,
      providesTags: ["WorkspaceMembers"],
    }),

    // POST /workspaces/{workspaceSlug}/members — Добавление существующего пользователя по user_id
    addWorkspaceMember: builder.mutation<
      WorkspaceMember,
      {
        workspaceSlug: string;
        user_id: string;
        role?: "admin" | "member" | "guest";
      }
    >({
      query: ({ workspaceSlug, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WorkspaceMembers"],
    }),

    // PATCH /workspaces/{workspaceSlug}/members/{userId} — Изменение роли участника
    updateWorkspaceMemberRole: builder.mutation<
      WorkspaceMember,
      {
        workspaceSlug: string;
        userId: string;
        role: "admin" | "member" | "guest";
      }
    >({
      query: ({ workspaceSlug, userId, role }) => ({
        url: `/workspaces/${workspaceSlug}/members/${userId}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["WorkspaceMembers"],
    }),

    // DELETE /workspaces/{workspaceSlug}/members/{userId} — Удаление участника из пространства
    removeWorkspaceMember: builder.mutation<
      void,
      { workspaceSlug: string; userId: string }
    >({
      query: ({ workspaceSlug, userId }) => ({
        url: `/workspaces/${workspaceSlug}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WorkspaceMembers"],
    }),

    // POST /workspaces/{workspaceSlug}/members/invite — Приглашение пользователя по email
    inviteWorkspaceMember: builder.mutation<
      WorkspaceInvite,
      {
        workspaceSlug: string;
        email: string;
        role?: "admin" | "member" | "guest";
      }
    >({
      query: ({ workspaceSlug, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/members/invite`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invites", "WorkspaceMembers"],
    }),

    // POST /workspaces/{workspaceSlug}/leave — Выход из рабочего пространства
    leaveWorkspace: builder.mutation<void, string>({
      query: (workspaceSlug) => ({
        url: `/workspaces/${workspaceSlug}/leave`,
        method: "POST",
      }),
      invalidatesTags: ["Workspaces", "WorkspaceMembers"],
    }),

    // POST /workspaces/{workspaceSlug}/transfer-ownership — Передача прав владельца другому участнику
    transferWorkspaceOwnership: builder.mutation<
      Workspace,
      { workspaceSlug: string; user_id: string }
    >({
      query: ({ workspaceSlug, user_id }) => ({
        url: `/workspaces/${workspaceSlug}/transfer-ownership`,
        method: "POST",
        body: { user_id },
      }),
      invalidatesTags: ["Workspaces", "WorkspaceMembers"],
    }),

    // ========================================================================
    // 4. PROJECTS (Проекты и участники проекта)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/ — Список проектов в пространстве
    getProjects: builder.query<Project[], string>({
      query: (workspaceSlug) => `/workspaces/${workspaceSlug}/projects/`,
      providesTags: ["Projects"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/ — Создание нового проекта
    createProject: builder.mutation<
      Project,
      {
        workspaceSlug: string;
        name: string;
        identifier: string;
        description?: string;
        lead_id?: string | null;
      }
    >({
      query: ({ workspaceSlug, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Projects"],
    }),

    // GET /workspaces/{workspaceSlug}/projects/{projectId} — Детали одного проекта
    getProjectById: builder.query<
      Project,
      { workspaceSlug: string; projectId: string }
    >({
      query: ({ workspaceSlug, projectId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}`,
      providesTags: ["Projects"],
    }),

    // PATCH /workspaces/{workspaceSlug}/projects/{projectId} — Обновление проекта
    updateProject: builder.mutation<
      Project,
      {
        workspaceSlug: string;
        projectId: string;
        name?: string;
        description?: string | null;
        lead_id?: string | null;
        is_archived?: boolean;
      }
    >({
      query: ({ workspaceSlug, projectId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Projects"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId} — Удаление проекта
    deleteProject: builder.mutation<
      void,
      { workspaceSlug: string; projectId: string }
    >({
      query: ({ workspaceSlug, projectId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/members — Список участников проекта
    getProjectMembers: builder.query<
      ProjectMember[],
      { workspaceSlug: string; projectId: string }
    >({
      query: ({ workspaceSlug, projectId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/members`,
      providesTags: ["ProjectMembers"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/members — Добавление участника в проект
    addProjectMember: builder.mutation<
      ProjectMember,
      {
        workspaceSlug: string;
        projectId: string;
        user_id: string;
        role?: ProjectRole;
      }
    >({
      query: ({ workspaceSlug, projectId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProjectMembers"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/members/{userId} — Удаление участника из проекта
    removeProjectMember: builder.mutation<
      void,
      { workspaceSlug: string; projectId: string; userId: string }
    >({
      query: ({ workspaceSlug, projectId, userId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProjectMembers"],
    }),

    // ========================================================================
    // 5. STATES (Статусы задач проекта)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/states/ — Список статусов проекта
    getStates: builder.query<
      ProjectState[],
      { workspaceSlug: string; projectId: string }
    >({
      query: ({ workspaceSlug, projectId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/states/`,
      providesTags: ["States"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/states/ — Создание статуса
    createState: builder.mutation<
      ProjectState,
      {
        workspaceSlug: string;
        projectId: string;
        name: string;
        color: string;
        group: StateGroup;
        order?: number;
        is_default?: boolean;
      }
    >({
      query: ({ workspaceSlug, projectId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/states/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["States"],
    }),

    // PATCH /workspaces/{workspaceSlug}/projects/{projectId}/states/{stateId} — Обновление статуса
    updateState: builder.mutation<
      ProjectState,
      {
        workspaceSlug: string;
        projectId: string;
        stateId: string;
        name?: string;
        color?: string;
        group?: StateGroup;
        order?: number;
        is_default?: boolean;
      }
    >({
      query: ({ workspaceSlug, projectId, stateId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["States", "Issues"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/states/{stateId} — Удаление статуса
    deleteState: builder.mutation<
      void,
      {
        workspaceSlug: string;
        projectId: string;
        stateId: string;
        transfer_to_state_id?: string;
      }
    >({
      query: ({ workspaceSlug, projectId, stateId, transfer_to_state_id }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}`,
        method: "DELETE",
        body: transfer_to_state_id ? { transfer_to_state_id } : {},
      }),
      invalidatesTags: ["States", "Issues"],
    }),

    // ========================================================================
    // 6. LABELS (Метки проекта)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/labels/ — Список меток проекта
    getLabels: builder.query<
      Label[],
      { workspaceSlug: string; projectId: string }
    >({
      query: ({ workspaceSlug, projectId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/labels/`,
      providesTags: ["Labels"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/labels/ — Создание метки
    createLabel: builder.mutation<
      Label,
      {
        workspaceSlug: string;
        projectId: string;
        name: string;
        color: string;
      }
    >({
      query: ({ workspaceSlug, projectId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/labels/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Labels"],
    }),

    // PATCH /workspaces/{workspaceSlug}/projects/{projectId}/labels/{labelId} — Обновление метки
    updateLabel: builder.mutation<
      Label,
      {
        workspaceSlug: string;
        projectId: string;
        labelId: string;
        name?: string;
        color?: string;
      }
    >({
      query: ({ workspaceSlug, projectId, labelId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/labels/${labelId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Labels", "Issues"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/labels/{labelId} — Удаление метки
    deleteLabel: builder.mutation<
      void,
      { workspaceSlug: string; projectId: string; labelId: string }
    >({
      query: ({ workspaceSlug, projectId, labelId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/labels/${labelId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Labels", "Issues"],
    }),

    // ========================================================================
    // 7. ISSUES (Задачи проекта, исполнители и метки задачи)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/ — Список задач с фильтрами
    getIssues: builder.query<
      IssuesListResponse,
      { workspaceSlug: string; projectId: string; filters?: IssueFilters }
    >({
      query: ({ workspaceSlug, projectId, filters }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/`,
        params: filters || {},
      }),
      providesTags: ["Issues"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/ — Создание задачи
    createIssue: builder.mutation<
      Issue,
      {
        workspaceSlug: string;
        projectId: string;
        title: string;
        state_id: string;
        description?: string;
        priority?: "none" | "low" | "medium" | "high" | "urgent";
        parent_id?: string | null;
        assignee_ids?: string[];
        label_ids?: string[];
        start_date?: string | null;
        due_date?: string | null;
        estimate_points?: number | null;
      }
    >({
      query: ({ workspaceSlug, projectId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Issues", "Cycles", "Modules"],
    }),

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId} — Детали задачи
    getIssueById: builder.query<
      Issue,
      { workspaceSlug: string; projectId: string; issueId: string }
    >({
      query: ({ workspaceSlug, projectId, issueId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
      providesTags: ["Issues"],
    }),

    // PATCH /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId} — Обновление задачи
    updateIssue: builder.mutation<
      Issue,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        title?: string;
        description?: string | null;
        state_id?: string;
        priority?: "none" | "low" | "medium" | "high" | "urgent";
        parent_id?: string | null;
        start_date?: string | null;
        due_date?: string | null;
        estimate_points?: number | null;
        sort_order?: number;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Issues", "Activity", "Cycles", "Modules"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId} — Удаление задачи
    deleteIssue: builder.mutation<
      void,
      { workspaceSlug: string; projectId: string; issueId: string }
    >({
      query: ({ workspaceSlug, projectId, issueId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Issues", "Cycles", "Modules"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/assignees — Назначить исполнителя
    addIssueAssignee: builder.mutation<
      Issue,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        user_id: string;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, user_id }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/assignees`,
        method: "POST",
        body: { user_id },
      }),
      invalidatesTags: ["Issues", "Activity"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/assignees/{userId} — Убрать исполнителя
    removeIssueAssignee: builder.mutation<
      Issue,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        userId: string;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, userId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/assignees/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Issues", "Activity"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/labels — Прикрепить метку к задаче
    attachIssueLabel: builder.mutation<
      Issue,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        label_id: string;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, label_id }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/labels`,
        method: "POST",
        body: { label_id },
      }),
      invalidatesTags: ["Issues", "Activity"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/labels/{labelId} — Открепить метку от задачи
    detachIssueLabel: builder.mutation<
      Issue,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        labelId: string;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, labelId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/labels/${labelId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Issues", "Activity"],
    }),

    // ========================================================================
    // 8. COMMENTS (Комментарии к задаче)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/comments/ — Список комментариев
    getComments: builder.query<
      Comment[],
      { workspaceSlug: string; projectId: string; issueId: string }
    >({
      query: ({ workspaceSlug, projectId, issueId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/`,
      providesTags: ["Comments"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/comments/ — Добавить комментарий
    createComment: builder.mutation<
      Comment,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        body: string;
        parent_comment_id?: string | null;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Comments", "Activity"],
    }),

    // PATCH /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/comments/{commentId} — Изменить комментарий
    updateComment: builder.mutation<
      Comment,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        commentId: string;
        body: string;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, commentId, body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
        method: "PATCH",
        body: { body },
      }),
      invalidatesTags: ["Comments"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/comments/{commentId} — Удалить комментарий
    deleteComment: builder.mutation<
      void,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        commentId: string;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, commentId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comments"],
    }),

    // ========================================================================
    // 9. CYCLES (Циклы / Спринты проекта)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/cycles/ — Список циклов
    getCycles: builder.query<
      Cycle[],
      { workspaceSlug: string; projectId: string }
    >({
      query: ({ workspaceSlug, projectId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/`,
      providesTags: ["Cycles"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/cycles/ — Создать цикл
    createCycle: builder.mutation<
      Cycle,
      {
        workspaceSlug: string;
        projectId: string;
        name: string;
        description?: string | null;
        start_date?: string | null;
        end_date?: string | null;
      }
    >({
      query: ({ workspaceSlug, projectId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cycles"],
    }),

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId} — Детали цикла с прогрессом
    getCycleById: builder.query<
      Cycle,
      { workspaceSlug: string; projectId: string; cycleId: string }
    >({
      query: ({ workspaceSlug, projectId, cycleId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`,
      providesTags: ["Cycles"],
    }),

    // PATCH /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId} — Обновить цикл
    updateCycle: builder.mutation<
      Cycle,
      {
        workspaceSlug: string;
        projectId: string;
        cycleId: string;
        name?: string;
        description?: string | null;
        start_date?: string | null;
        end_date?: string | null;
      }
    >({
      query: ({ workspaceSlug, projectId, cycleId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Cycles"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId} — Удалить цикл
    deleteCycle: builder.mutation<
      void,
      { workspaceSlug: string; projectId: string; cycleId: string }
    >({
      query: ({ workspaceSlug, projectId, cycleId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cycles"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId}/issues — Добавить задачи в цикл
    addIssuesToCycle: builder.mutation<
      { added: number },
      {
        workspaceSlug: string;
        projectId: string;
        cycleId: string;
        issue_ids: string[];
      }
    >({
      query: ({ workspaceSlug, projectId, cycleId, issue_ids }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/issues`,
        method: "POST",
        body: { issue_ids },
      }),
      invalidatesTags: ["Cycles", "Issues"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId}/issues/{issueId} — Убрать задачу из цикла
    removeIssueFromCycle: builder.mutation<
      void,
      {
        workspaceSlug: string;
        projectId: string;
        cycleId: string;
        issueId: string;
      }
    >({
      query: ({ workspaceSlug, projectId, cycleId, issueId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/issues/${issueId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cycles", "Issues"],
    }),

    // ========================================================================
    // 10. MODULES (Модули проекта)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/modules/ — Список модулей
    getModules: builder.query<
      Module[],
      { workspaceSlug: string; projectId: string }
    >({
      query: ({ workspaceSlug, projectId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/modules/`,
      providesTags: ["Modules"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/modules/ — Создать модуль
    createModule: builder.mutation<
      Module,
      {
        workspaceSlug: string;
        projectId: string;
        name: string;
        description?: string | null;
        status?: "backlog" | "in_progress" | "paused" | "completed" | "cancelled";
        lead_id?: string | null;
        start_date?: string | null;
        target_date?: string | null;
      }
    >({
      query: ({ workspaceSlug, projectId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/modules/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Modules"],
    }),

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId} — Детали модуля с прогрессом
    getModuleById: builder.query<
      Module,
      { workspaceSlug: string; projectId: string; moduleId: string }
    >({
      query: ({ workspaceSlug, projectId, moduleId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}`,
      providesTags: ["Modules"],
    }),

    // PATCH /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId} — Обновить модуль
    updateModule: builder.mutation<
      Module,
      {
        workspaceSlug: string;
        projectId: string;
        moduleId: string;
        name?: string;
        description?: string | null;
        status?: "backlog" | "in_progress" | "paused" | "completed" | "cancelled";
        lead_id?: string | null;
        start_date?: string | null;
        target_date?: string | null;
      }
    >({
      query: ({ workspaceSlug, projectId, moduleId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Modules"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId} — Удалить модуль
    deleteModule: builder.mutation<
      void,
      { workspaceSlug: string; projectId: string; moduleId: string }
    >({
      query: ({ workspaceSlug, projectId, moduleId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Modules"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId}/issues — Добавить задачи в модуль
    addIssuesToModule: builder.mutation<
      { added: number },
      {
        workspaceSlug: string;
        projectId: string;
        moduleId: string;
        issue_ids: string[];
      }
    >({
      query: ({ workspaceSlug, projectId, moduleId, issue_ids }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/issues`,
        method: "POST",
        body: { issue_ids },
      }),
      invalidatesTags: ["Modules", "Issues"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId}/issues/{issueId} — Убрать задачу из модуля
    removeIssueFromModule: builder.mutation<
      void,
      {
        workspaceSlug: string;
        projectId: string;
        moduleId: string;
        issueId: string;
      }
    >({
      query: ({ workspaceSlug, projectId, moduleId, issueId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/issues/${issueId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Modules", "Issues"],
    }),

    // ========================================================================
    // 11. ISSUE RELATIONS (Связи между задачами)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/relations/ — Список связей задачи
    getIssueRelations: builder.query<
      IssueRelationsResponse,
      { workspaceSlug: string; projectId: string; issueId: string }
    >({
      query: ({ workspaceSlug, projectId, issueId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/relations/`,
      providesTags: ["Relations"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/relations/ — Создать связь между задачами
    createIssueRelation: builder.mutation<
      IssueRelationItem,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        related_issue_id: string;
        relation_type: RelationType;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/relations/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Relations", "Activity"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/relations/{linkId} — Удалить связь
    deleteIssueRelation: builder.mutation<
      void,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        linkId: string;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, linkId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/relations/${linkId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Relations", "Activity"],
    }),

    // ========================================================================
    // 12. ACTIVITY (История действий по задаче)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/activity/ — История изменений задачи
    getIssueActivity: builder.query<
      ActivityListResponse,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        cursor?: string;
        limit?: number;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, cursor, limit }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/activity/`,
        params: { cursor, limit },
      }),
      providesTags: ["Activity"],
    }),

    // ========================================================================
    // 13. ATTACHMENTS (Вложения к задаче)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/attachments/ — Список вложений задачи
    getIssueAttachments: builder.query<
      Attachment[],
      { workspaceSlug: string; projectId: string; issueId: string }
    >({
      query: ({ workspaceSlug, projectId, issueId }) =>
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/attachments/`,
      providesTags: ["Attachments"],
    }),

    // POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/attachments/ — Регистрация вложения
    registerAttachment: builder.mutation<
      RegisterAttachmentResponse,
      {
        workspaceSlug: string;
        projectId: string;
        issueId: string;
        file_name: string;
        file_size: number;
        mime_type: string;
      }
    >({
      query: ({ workspaceSlug, projectId, issueId, ...body }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/attachments/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attachments", "Activity"],
    }),

    // DELETE /workspaces/{workspaceSlug}/projects/{projectId}/attachments/{attachmentId} — Удалить вложение
    deleteAttachment: builder.mutation<
      void,
      { workspaceSlug: string; projectId: string; attachmentId: string }
    >({
      query: ({ workspaceSlug, projectId, attachmentId }) => ({
        url: `/workspaces/${workspaceSlug}/projects/${projectId}/attachments/${attachmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attachments"],
    }),

    // ========================================================================
    // 14. NOTIFICATIONS (Уведомления в рабочем пространстве)
    // ========================================================================

    // GET /workspaces/{workspaceSlug}/notifications/ — Список уведомлений пользователя
    getNotifications: builder.query<
      NotificationsListResponse,
      {
        workspaceSlug: string;
        read?: "true" | "false";
        cursor?: string;
        limit?: number;
      }
    >({
      query: ({ workspaceSlug, ...params }) => ({
        url: `/workspaces/${workspaceSlug}/notifications/`,
        params,
      }),
      providesTags: ["Notifications"],
    }),

    // POST /workspaces/{workspaceSlug}/notifications/read-all — Отметить все уведомления как прочитанные
    markAllNotificationsRead: builder.mutation<
      { updated: number },
      { workspaceSlug: string }
    >({
      query: ({ workspaceSlug }) => ({
        url: `/workspaces/${workspaceSlug}/notifications/read-all`,
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // POST /workspaces/{workspaceSlug}/notifications/{notificationId}/read — Отметить одно уведомление прочитанным
    markNotificationRead: builder.mutation<
      NotificationItem,
      { workspaceSlug: string; notificationId: string }
    >({
      query: ({ workspaceSlug, notificationId }) => ({
        url: `/workspaces/${workspaceSlug}/notifications/${notificationId}/read`,
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // ========================================================================
    // 15. INVITES (Приглашения по токену)
    // ========================================================================

    // GET /invites/{token} — Получить информацию о приглашении (публичный запрос)
    getInviteByToken: builder.query<WorkspaceInvite, string>({
      query: (token) => `/invites/${token}`,
      providesTags: ["Invites"],
    }),

    // POST /invites/{token}/accept — Принять приглашение в рабочее пространство
    acceptInvite: builder.mutation<
      { workspace_id: string; user_id: string; role: string },
      string
    >({
      query: (token) => ({
        url: `/invites/${token}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Invites", "Workspaces", "WorkspaceMembers"],
    }),
  }),
});

// Экспортируем готовые хуки RTK Query для использования на страницах
export const {
  // 1. Storage
  useUploadInternalStorageMutation,
  useGetInternalStorageQuery,
  useLazyGetInternalStorageQuery,

  // 2. Auth
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,

  // 3. Workspaces
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useGetWorkspaceBySlugQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useAddWorkspaceMemberMutation,
  useUpdateWorkspaceMemberRoleMutation,
  useRemoveWorkspaceMemberMutation,
  useInviteWorkspaceMemberMutation,
  useLeaveWorkspaceMutation,
  useTransferWorkspaceOwnershipMutation,

  // 4. Projects
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,

  // 5. States
  useGetStatesQuery,
  useCreateStateMutation,
  useUpdateStateMutation,
  useDeleteStateMutation,

  // 6. Labels
  useGetLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,

  // 7. Issues
  useGetIssuesQuery,
  useCreateIssueMutation,
  useGetIssueByIdQuery,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
  useAddIssueAssigneeMutation,
  useRemoveIssueAssigneeMutation,
  useAttachIssueLabelMutation,
  useDetachIssueLabelMutation,

  // 8. Comments
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,

  // 9. Cycles
  useGetCyclesQuery,
  useCreateCycleMutation,
  useGetCycleByIdQuery,
  useUpdateCycleMutation,
  useDeleteCycleMutation,
  useAddIssuesToCycleMutation,
  useRemoveIssueFromCycleMutation,

  // 10. Modules
  useGetModulesQuery,
  useCreateModuleMutation,
  useGetModuleByIdQuery,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useAddIssuesToModuleMutation,
  useRemoveIssueFromModuleMutation,

  // 11. Relations
  useGetIssueRelationsQuery,
  useCreateIssueRelationMutation,
  useDeleteIssueRelationMutation,

  // 12. Activity
  useGetIssueActivityQuery,

  // 13. Attachments
  useGetIssueAttachmentsQuery,
  useRegisterAttachmentMutation,
  useDeleteAttachmentMutation,

  // 14. Notifications
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,

  // 15. Invites
  useGetInviteByTokenQuery,
  useAcceptInviteMutation,
} = taskApi;
