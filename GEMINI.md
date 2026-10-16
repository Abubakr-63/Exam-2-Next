# GEMINI.md — Контекст и карта проекта для ИИ-агентов и разработчиков

> **ВАЖНО ДЛЯ ЛЮБОГО ИИ-АГЕНТА В НОВОМ ЧАТЕ:**  
> Прочитай этот файл перед тем, как сканировать проект заново. Вся базовая архитектура, все 76 эндпоинтов из Swagger (`http://127.0.0.1:4000/docs/json`, кроме `/health`), типы TypeScript, Redux Store (RTK Query), защита от ошибок `Blocking Route` в Next.js 16.4.2 и клиентский интерфейс в стиле **Plane** (Канбан-доска + боковая панель задачи) на `shadcn/ui` + `lucide-react` **уже полностью созданы и связаны**. Не переписывай рабочие слои с нуля — вноси только точечные правки по запросу пользователя.

## 1. О чём этот проект и главные условия ТЗ

- **Фреймворк:** Next.js 16.4.2 (App Router, TypeScript, Tailwind CSS v4).
- **Бэкенд (Swagger / OpenAPI 3.0.3):** `Task Management API 0.1.0` (Plane / Jira).
  - Ссылка на схему: `http://127.0.0.1:4000/docs/json`
  - Базовый URL API: `http://127.0.0.1:4000/api/v1` (задается через `process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api/v1"` в `store/api.ts`).
- **Главное правило по эндпоинтам:** Реализованы **абсолютно все 76 запросов из Swagger, КРОМЕ `GET /health`**. Запрос `/health` специально исключён по заданию — **не добавляй его**.
- **Стейт-менеджер и запросы:** Только **RTK Query** (`@reduxjs/toolkit/query/react`).
- **Дизайн (Plane UI):** Тёмный современный клиентский интерфейс в стиле **Plane** (`shadcn/ui` + `lucide-react`) без показа технических путей API пользователю:
  - Канбан-доска с колонками (`Backlog`, `Todo`, `In Progress`, `Done`, `Cancelled`), кнопкой создания 5 стандартных колонок в 1 клик, быстрым добавлением задач прямо внутри колонки по нажатию `Enter`, быстрым переключением статуса и приоритета прямо на карточке задачи, контекстным меню `...` и выезжающей справа боковой панелью деталей задачи (`IssueSlideOverDrawer`).
- **Защита от ошибок Next.js 16.4.2 (`Blocking Route`):**
  - В `next.config.ts` отключены флаги `cacheComponents` и `partialPrefetching`, которые вызывали ошибки пререндера при вызове `Date.now()` внутри RTK Query и клиентских хуков `usePathname()` / `useParams()`.
  - В `store/provider.tsx` добавлены `<Suspense>` и проверка монтирования на клиенте (`mounted`), а все страницы и `Navbar` обёрнуты в `<Suspense>`. **Не удаляй эти обёртки!**

## 2. Структура папок и файлов (Где что лежит)

| Путь файла | Назначение и статус |
| :--- | :--- |
| `next.config.ts` | Конфигурация Next.js 16 без `cacheComponents`, исключающая ошибки `Blocking Route`. **Готово.** |
| `types/api.ts` | Все TypeScript-интерфейсы для всех 15 сущностей из Swagger. **Готово.** |
| `store/api.ts` | Единый файл RTK Query (`taskApi`) со всеми **76 эндпоинтами** (кроме `/health`), автоматической подстановкой `Bearer` токена из `localStorage` и авто-инвалидацией кэша (`tagTypes`). **Готово.** |
| `store/store.ts` | Конфигурация `configureStore` с подключением `taskApi.reducer` и `taskApi.middleware`. **Готово.** |
| `store/provider.tsx` | Клиентская обёртка `<ReduxProvider>` с `<Suspense>` и `mounted`-защитой от SSR-конфликтов `Date.now()`. **Готово.** |
| `components/navbar.tsx` | Верхняя навигация в стиле Plane со ссылками на пространства, приглашения, профиль и быстрым переходом в активный Workspace. **Готово.** |
| `components/ui/*` | Компоненты в стиле `shadcn/ui` (`button.tsx`, `input.tsx`, `textarea.tsx`, `card.tsx`, `badge.tsx`, `label.tsx`, `tabs.tsx`, `table.tsx`), адаптированные под тему Plane. **Готово.** |
| `app/layout.tsx` | Корневой Layout с тёмной темой Plane, `<ReduxProvider>` и `<Navbar />`. **Готово.** |
| `app/page.tsx` | Главная страница: приветственный баннер, список рабочих пространств, создание и удаление пространств. **Готово.** |
| `app/auth/page.tsx` | Страница аккаунта (вкладки Вход, Регистрация, Настройки профиля, Смена пароля + кнопки продления сессии и выхода). **Готово.** |
| `app/invites/page.tsx` и `app/invites/[token]/page.tsx` | Поиск приглашения по коду и присоединение к команде. **Готово.** |
| `app/workspaces/[workspaceSlug]/page.tsx` | Страница Workspace (4 вкладки): Проекты, Команда и приглашения, Центр уведомлений, Настройки. **Готово.** |
| `app/workspaces/[workspaceSlug]/projects/[projectId]/page.tsx` | Главный экран проекта как в Plane: Канбан-доска (`Backlog`, `Todo`, `In Progress`, `Done`, `Cancelled`), инлайн-создание задач в колонке, выезжающая справа панель задачи (`IssueSlideOverDrawer`), а также вкладки «Список», «Циклы», «Модули», «Статусы и метки», «Участники» и «Настройки». **Готово.** |
| `app/workspaces/[workspaceSlug]/projects/[projectId]/issues/[issueId]/page.tsx` | Полноэкранная страница задачи (двухколоночный макет: описание, обсуждение и история слева; исполнители, метки, связи и файлы справа). **Готово.** |

## 3. Полный реестр эндпоинтов RTK Query в `store/api.ts` (Не дублировать!)

Все хуки экспортируются напрямую из `@/store/api`:

| Раздел | HTTP метод и путь в Swagger | Хук в `store/api.ts` | Где используется в UI |
| :--- | :--- | :--- | :--- |
| **Internal Storage** | `PUT /internal/storage/{*}` | `useUploadInternalStorageMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Internal Storage** | `GET /internal/storage/{*}` | `useGetInternalStorageQuery`, `useLazyGetInternalStorageQuery` | `.../issues/[issueId]/page.tsx` |
| **Auth** | `POST /auth/register` | `useRegisterMutation` | `app/auth/page.tsx` |
| **Auth** | `POST /auth/login` | `useLoginMutation` | `app/auth/page.tsx` |
| **Auth** | `POST /auth/refresh` | `useRefreshTokenMutation` | `app/auth/page.tsx` |
| **Auth** | `POST /auth/logout` | `useLogoutMutation` | `app/auth/page.tsx` |
| **Auth** | `GET /auth/me` | `useGetMeQuery` | `components/navbar.tsx`, `app/page.tsx`, `app/auth/page.tsx` |
| **Auth** | `PATCH /auth/me` | `useUpdateMeMutation` | `app/auth/page.tsx` |
| **Auth** | `POST /auth/change-password` | `useChangePasswordMutation` | `app/auth/page.tsx` |
| **Workspaces** | `GET /workspaces/` | `useGetWorkspacesQuery` | `components/navbar.tsx`, `app/page.tsx` |
| **Workspaces** | `POST /workspaces/` | `useCreateWorkspaceMutation` | `app/page.tsx` |
| **Workspaces** | `GET /workspaces/{workspaceSlug}` | `useGetWorkspaceBySlugQuery` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Workspaces** | `PATCH /workspaces/{workspaceSlug}` | `useUpdateWorkspaceMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Workspaces** | `DELETE /workspaces/{workspaceSlug}` | `useDeleteWorkspaceMutation` | `app/page.tsx`, `app/workspaces/[workspaceSlug]/page.tsx` |
| **Workspaces** | `GET /workspaces/{workspaceSlug}/members` | `useGetWorkspaceMembersQuery` | `app/workspaces/[workspaceSlug]/page.tsx`, `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Workspaces** | `POST /workspaces/{workspaceSlug}/members` | `useAddWorkspaceMemberMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Workspaces** | `PATCH /workspaces/{workspaceSlug}/members/{userId}` | `useUpdateWorkspaceMemberRoleMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Workspaces** | `DELETE /workspaces/{workspaceSlug}/members/{userId}` | `useRemoveWorkspaceMemberMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Workspaces** | `POST /workspaces/{workspaceSlug}/members/invite` | `useInviteWorkspaceMemberMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Workspaces** | `POST /workspaces/{workspaceSlug}/leave` | `useLeaveWorkspaceMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Workspaces** | `POST /workspaces/{workspaceSlug}/transfer-ownership` | `useTransferWorkspaceOwnershipMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Projects** | `GET /workspaces/{workspaceSlug}/projects/` | `useGetProjectsQuery` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Projects** | `POST /workspaces/{workspaceSlug}/projects/` | `useCreateProjectMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Projects** | `GET /workspaces/{workspaceSlug}/projects/{projectId}` | `useGetProjectByIdQuery` | `.../projects/[projectId]/page.tsx` |
| **Projects** | `PATCH /workspaces/{workspaceSlug}/projects/{projectId}` | `useUpdateProjectMutation` | `.../projects/[projectId]/page.tsx` |
| **Projects** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}` | `useDeleteProjectMutation` | `app/workspaces/[workspaceSlug]/page.tsx`, `.../projects/[projectId]/page.tsx` |
| **Projects** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/members` | `useGetProjectMembersQuery` | `.../projects/[projectId]/page.tsx` |
| **Projects** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/members` | `useAddProjectMemberMutation` | `.../projects/[projectId]/page.tsx` |
| **Projects** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/members/{userId}` | `useRemoveProjectMemberMutation` | `.../projects/[projectId]/page.tsx` |
| **States** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/states/` | `useGetStatesQuery` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **States** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/states/` | `useCreateStateMutation` | `.../projects/[projectId]/page.tsx` |
| **States** | `PATCH /workspaces/{workspaceSlug}/projects/{projectId}/states/{stateId}` | `useUpdateStateMutation` | `.../projects/[projectId]/page.tsx` |
| **States** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/states/{stateId}` | `useDeleteStateMutation` | `.../projects/[projectId]/page.tsx` |
| **Labels** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/labels/` | `useGetLabelsQuery` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Labels** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/labels/` | `useCreateLabelMutation` | `.../projects/[projectId]/page.tsx` |
| **Labels** | `PATCH /workspaces/{workspaceSlug}/projects/{projectId}/labels/{labelId}` | `useUpdateLabelMutation` | `.../projects/[projectId]/page.tsx` |
| **Labels** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/labels/{labelId}` | `useDeleteLabelMutation` | `.../projects/[projectId]/page.tsx` |
| **Issues** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/` | `useGetIssuesQuery` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Issues** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/` | `useCreateIssueMutation` | `.../projects/[projectId]/page.tsx` |
| **Issues** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}` | `useGetIssueByIdQuery` | `.../issues/[issueId]/page.tsx` |
| **Issues** | `PATCH /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}` | `useUpdateIssueMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Issues** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}` | `useDeleteIssueMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Issues** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/assignees` | `useAddIssueAssigneeMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Issues** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/assignees/{userId}` | `useRemoveIssueAssigneeMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Issues** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/labels` | `useAttachIssueLabelMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Issues** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/labels/{labelId}` | `useDetachIssueLabelMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Comments** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/comments/` | `useGetCommentsQuery` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Comments** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/comments/` | `useCreateCommentMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Comments** | `PATCH /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/comments/{commentId}` | `useUpdateCommentMutation` | `.../issues/[issueId]/page.tsx` |
| **Comments** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/comments/{commentId}` | `useDeleteCommentMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Cycles** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/cycles/` | `useGetCyclesQuery` | `.../projects/[projectId]/page.tsx` |
| **Cycles** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/cycles/` | `useCreateCycleMutation` | `.../projects/[projectId]/page.tsx` |
| **Cycles** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId}` | `useGetCycleByIdQuery` | `.../projects/[projectId]/page.tsx` |
| **Cycles** | `PATCH /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId}` | `useUpdateCycleMutation` | `.../projects/[projectId]/page.tsx` |
| **Cycles** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId}` | `useDeleteCycleMutation` | `.../projects/[projectId]/page.tsx` |
| **Cycles** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId}/issues` | `useAddIssuesToCycleMutation` | `.../projects/[projectId]/page.tsx` |
| **Cycles** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/cycles/{cycleId}/issues/{issueId}` | `useRemoveIssueFromCycleMutation` | `.../projects/[projectId]/page.tsx` |
| **Modules** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/modules/` | `useGetModulesQuery` | `.../projects/[projectId]/page.tsx` |
| **Modules** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/modules/` | `useCreateModuleMutation` | `.../projects/[projectId]/page.tsx` |
| **Modules** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId}` | `useGetModuleByIdQuery` | `.../projects/[projectId]/page.tsx` |
| **Modules** | `PATCH /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId}` | `useUpdateModuleMutation` | `.../projects/[projectId]/page.tsx` |
| **Modules** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId}` | `useDeleteModuleMutation` | `.../projects/[projectId]/page.tsx` |
| **Modules** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId}/issues` | `useAddIssuesToModuleMutation` | `.../projects/[projectId]/page.tsx` |
| **Modules** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/modules/{moduleId}/issues/{issueId}` | `useRemoveIssueFromModuleMutation` | `.../projects/[projectId]/page.tsx` |
| **Relations** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/relations/` | `useGetIssueRelationsQuery` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Relations** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/relations/` | `useCreateIssueRelationMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Relations** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/relations/{linkId}` | `useDeleteIssueRelationMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Activity** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/activity/` | `useGetIssueActivityQuery` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Attachments** | `GET /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/attachments/` | `useGetIssueAttachmentsQuery` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Attachments** | `POST /workspaces/{workspaceSlug}/projects/{projectId}/issues/{issueId}/attachments/` | `useRegisterAttachmentMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Attachments** | `DELETE /workspaces/{workspaceSlug}/projects/{projectId}/attachments/{attachmentId}` | `useDeleteAttachmentMutation` | `.../projects/[projectId]/page.tsx`, `.../issues/[issueId]/page.tsx` |
| **Notifications** | `GET /workspaces/{workspaceSlug}/notifications/` | `useGetNotificationsQuery` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Notifications** | `POST /workspaces/{workspaceSlug}/notifications/read-all` | `useMarkAllNotificationsReadMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Notifications** | `POST /workspaces/{workspaceSlug}/notifications/{notificationId}/read` | `useMarkNotificationReadMutation` | `app/workspaces/[workspaceSlug]/page.tsx` |
| **Invites** | `GET /invites/{token}` | `useGetInviteByTokenQuery` | `app/invites/page.tsx`, `app/invites/[token]/page.tsx` |
| **Invites** | `POST /invites/{token}/accept` | `useAcceptInviteMutation` | `app/invites/page.tsx`, `app/invites/[token]/page.tsx` |

## 4. Правила для будущих правок (Что исправлять, а что НЕ трогать)

1. **Что НЕ нужно трогать без прямой просьбы:**
   - Не включай обратно `cacheComponents: true` в `next.config.ts` и не убирай `<Suspense>` и `mounted` из `store/provider.tsx` — иначе в Next.js 16 вернутся ошибки `Blocking Route` (`Date.now()`, `usePathname()`, `useParams()`).
   - Не дроби `store/api.ts` на мелкие файлы и не добавляй `/health`.
2. **Как запускать проект локально:**
   ```bash
   npm install
   npm run dev
   ```
