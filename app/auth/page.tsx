"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogIn,
  UserPlus,
  UserCog,
  KeyRound,
  RefreshCcw,
  LogOut,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function AuthContent() {
  const router = useRouter();
  const { data: me, refetch: refetchMe, isError } = useGetMeQuery();

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [updateMe, { isLoading: isUpdatingMe }] = useUpdateMeMutation();
  const [changePassword, { isLoading: isChangingPass }] =
    useChangePasswordMutation();
  const [refreshTokenMutation, { isLoading: isRefreshing }] =
    useRefreshTokenMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regInviteToken, setRegInviteToken] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (me) {
      setDisplayName(me.display_name || "");
      setAvatarUrl(me.avatar_url || "");
    }
  }, [me]);

  const saveTokens = (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    try {
      const res = await login({
        email: loginEmail,
        password: loginPassword,
      }).unwrap();
      saveTokens(res.access_token, res.refresh_token);
      setStatusMessage("Вы успешно вошли в аккаунт!");
      refetchMe();
      router.push("/");
    } catch (err: any) {
      setStatusMessage(
        err?.data?.message || "Неверный email или пароль. Попробуйте снова."
      );
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    try {
      const res = await register({
        email: regEmail,
        password: regPassword,
        display_name: regName,
        invite_token: regInviteToken || undefined,
      }).unwrap();
      saveTokens(res.access_token, res.refresh_token);
      setStatusMessage("Аккаунт создан! Добро пожаловать.");
      refetchMe();
      router.push("/");
    } catch (err: any) {
      setStatusMessage(
        err?.data?.message || "Не удалось зарегистрироваться. Проверьте данные."
      );
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    try {
      await updateMe({
        display_name: displayName,
        avatar_url: avatarUrl || null,
      }).unwrap();
      setStatusMessage("Личные данные сохранены!");
      refetchMe();
    } catch (err: any) {
      setStatusMessage(err?.data?.message || "Ошибка при сохранении профиля.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setStatusMessage("Пароль успешно изменён!");
    } catch (err: any) {
      setStatusMessage(err?.data?.message || "Не удалось изменить пароль.");
    }
  };

  const handleRefreshToken = async () => {
    setStatusMessage("");
    const storedRefresh = localStorage.getItem("refresh_token");
    if (!storedRefresh) {
      setStatusMessage("Сессия не найдена. Пожалуйста, войдите заново.");
      return;
    }
    try {
      const res = await refreshTokenMutation({
        refresh_token: storedRefresh,
      }).unwrap();
      saveTokens(res.access_token, res.refresh_token);
      setStatusMessage("Сессия успешно продлена!");
      refetchMe();
    } catch (err: any) {
      setStatusMessage(err?.data?.message || "Не удалось обновить сессию.");
    }
  };

  const handleLogout = async () => {
    setStatusMessage("");
    const storedRefresh = localStorage.getItem("refresh_token") || "";
    try {
      if (storedRefresh) {
        await logoutMutation({ refresh_token: storedRefresh }).unwrap();
      }
    } catch {
      // Игнорируем ошибку, если сессия уже закрыта
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setStatusMessage("Вы вышли из аккаунта.");
      refetchMe();
    }
  };

  const isLogged = Boolean(me && !isError);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Аккаунт и безопасность
          </h1>
          <p className="text-xs text-zinc-400">
            Вход в систему, создание нового аккаунта и настройка личного профиля
          </p>
        </div>
        {statusMessage && (
          <Badge variant="default" className="py-1.5 px-3 text-xs">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {statusMessage}
          </Badge>
        )}
      </div>

      {/* Карточка текущего пользователя */}
      {isLogged && me && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600/20 border border-emerald-500/30 text-sm font-bold text-emerald-300 uppercase">
                {me.display_name?.slice(0, 2) || "ME"}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>{me.display_name}</span>
                  <Badge variant="secondary">Активен</Badge>
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {me.email} • Ваш ID: <code className="text-zinc-300">{me.id}</code>
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshToken}
                disabled={isRefreshing}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Продлить сессию
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-3.5 w-3.5" />
                Выйти
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue={isLogged ? "profile" : "login"}>
        <TabsList>
          <TabsTrigger value="login">
            <LogIn className="h-3.5 w-3.5" />
            Вход
          </TabsTrigger>
          <TabsTrigger value="register">
            <UserPlus className="h-3.5 w-3.5" />
            Регистрация
          </TabsTrigger>
          <TabsTrigger value="profile">
            <UserCog className="h-3.5 w-3.5" />
            Настройки профиля
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="h-3.5 w-3.5" />
            Смена пароля
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Вход в систему</CardTitle>
              <CardDescription>
                Введите ваш email и пароль для доступа к проектам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Электронная почта</Label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Пароль</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Вход..." : "Войти в аккаунт"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Создание нового аккаунта</CardTitle>
              <CardDescription>
                Заполните поля ниже. Если вас пригласили в команду, укажите код приглашения.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Ваше имя и фамилия</Label>
                  <Input
                    placeholder="Абубакр Курбонов"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Электронная почта</Label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Пароль (не менее 8 символов)</Label>
                  <Input
                    type="password"
                    placeholder="Минимум 8 символов"
                    minLength={8}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Код приглашения (необязательно)</Label>
                  <Input
                    placeholder="Вставьте токен приглашения, если есть"
                    value={regInviteToken}
                    onChange={(e) => setRegInviteToken(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isRegistering}
                >
                  {isRegistering ? "Создание аккаунта..." : "Зарегистрироваться"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
              <CardDescription>
                Обновите ваше отображаемое имя и изображение профиля
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Отображаемое имя</Label>
                  <Input
                    placeholder="Ваше имя"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Ссылка на аватар (URL)</Label>
                  <Input
                    placeholder="https://example.com/avatar.png"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isUpdatingMe}>
                  {isUpdatingMe ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-400" />
                Изменение пароля
              </CardTitle>
              <CardDescription>
                После смены пароля все старые сессии будут автоматически закрыты
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Текущий пароль</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Новый пароль (не менее 8 символов)</Label>
                  <Input
                    type="password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isChangingPass}>
                  {isChangingPass ? "Обновление..." : "Обновить пароль"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-400">
          Загрузка профиля...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
