// ============================================================================
// ВСЕ ТИПЫ ДАННЫХ ИЗ SWAGGER (Task Management API 0.1.0)
// Написаны максимально просто и понятно для начинающих.
// ============================================================================

// --- 1. Пользователь и Авторизация (Auth) ---
export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// --- 2. Рабочее пространство (Workspaces) ---
export type WorkspaceRole = "owner" | "admin" | "member" | "guest";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  invited_by_id?: string;
  email: string;
  role: "admin" | "member" | "guest";
  token?: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at?: string;
  workspace?: {
    id: string;
    name: string;
    slug: string;
  };
  invited_by?: {
    id: string;
    display_name: string;
    email: string;
  };
}

// --- 3. Проекты (Projects) ---
export type ProjectRole = "admin" | "member" | "viewer";

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  identifier: string;
  description: string | null;
  lead_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
  user: User;
}

// --- 4. Статусы задач (States) ---
export type StateGroup =
  | "backlog"
  | "unstarted"
  | "started"
  | "completed"
  | "cancelled";

export interface ProjectState {
  id: string;
  project_id: string;
  name: string;
  color: string;
  group: StateGroup;
  order: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// --- 5. Метки (Labels) ---
export interface Label {
  id: string;
  workspace_id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// --- 6. Задачи (Issues) ---
export type IssuePriority = "none" | "low" | "medium" | "high" | "urgent";

export interface Issue {
  id: string;
  workspace_id: string;
  project_id: string;
  sequence_id: number;
  title: string;
  description: string | null;
  state_id: string;
  priority: IssuePriority;
  parent_id: string | null;
  estimate_points: number | null;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_by_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  assignees: any[];
  labels: any[];
}

export interface IssuesListResponse {
  data: Issue[];
  next_cursor: string | null;
  group_by?: "state" | "priority" | "assignee";
  groups?: {
    key: string | null;
    issues: Issue[];
  }[];
}

export interface IssueFilters {
  state?: string | string[];
  priority?: string | string[];
  assignee?: string | string[];
  label?: string | string[];
  cycle?: string;
  module?: string;
  created_by?: string;
  parent_id?: string;
  search?: string;
  due_before?: string;
  due_after?: string;
  created_before?: string;
  created_after?: string;
  sort_by?: "created_at" | "updated_at" | "priority" | "due_date" | "sort_order";
  order?: "asc" | "desc";
  group_by?: "state" | "priority" | "assignee";
  cursor?: string;
  limit?: number;
}

// --- 7. Комментарии (Comments) ---
export interface Comment {
  id: string;
  issue_id: string;
  author_id: string;
  body: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  author: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// --- 8. Прогресс для Циклов и Модулей ---
export interface ProgressStats {
  total: number;
  backlog: number;
  unstarted: number;
  started: number;
  completed: number;
  cancelled: number;
  completion_percentage: number;
}

// --- 9. Циклы / Спринты (Cycles) ---
export type CycleStatus = "upcoming" | "active" | "completed";

export interface Cycle {
  id: string;
  workspace_id: string;
  project_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: CycleStatus;
  created_at: string;
  updated_at: string;
  progress?: ProgressStats;
}

// --- 10. Модули (Modules) ---
export type ModuleStatus =
  | "backlog"
  | "in_progress"
  | "paused"
  | "completed"
  | "cancelled";

export interface Module {
  id: string;
  workspace_id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: ModuleStatus;
  lead_id: string | null;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  progress?: ProgressStats;
}

// --- 11. Связи задач (Issue Relations) ---
export type RelationType =
  | "blocks"
  | "blocked_by"
  | "relates_to"
  | "duplicates";

export interface IssueRelationItem {
  id: string;
  issue_id: string;
  related_issue_id: string;
  relation_type: RelationType;
  created_at: string;
  related_issue: {
    id: string;
    sequence_id: number;
    title: string;
    priority: string;
    state_id: string;
    project_id: string;
  };
}

export interface IssueRelationsResponse {
  blocks: IssueRelationItem[];
  blocked_by: IssueRelationItem[];
  relates_to: IssueRelationItem[];
  duplicates: IssueRelationItem[];
}

// --- 12. История активности (Activity) ---
export interface ActivityItem {
  id: string;
  workspace_id: string;
  issue_id: string | null;
  actor_id: string;
  action: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  actor: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface ActivityListResponse {
  data: ActivityItem[];
  next_cursor: string | null;
}

// --- 13. Вложения (Attachments) ---
export interface Attachment {
  id: string;
  workspace_id: string;
  issue_id: string;
  uploaded_by_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_key: string;
  created_at: string;
  uploaded_by: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  download_url: string;
}

export interface RegisterAttachmentResponse {
  attachment: Attachment;
  upload: {
    url: string;
    method: string;
    headers: Record<string, string>;
    expires_in: number;
  };
}

// --- 14. Уведомления (Notifications) ---
export type NotificationType =
  | "issue_assigned"
  | "comment_added"
  | "mentioned";

export interface NotificationItem {
  id: string;
  workspace_id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  issue_id: string | null;
  entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  actor: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface NotificationsListResponse {
  data: NotificationItem[];
  unread_count: number;
  next_cursor: string | null;
}
