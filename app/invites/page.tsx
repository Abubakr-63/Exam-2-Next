"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { MailCheck, Search, CheckCircle } from "lucide-react";
import { useGetInviteByTokenQuery, useAcceptInviteMutation } from "@/store/api";
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

function InvitesLookupContent() {
  const [tokenInput, setTokenInput] = useState("");
  const [submittedToken, setSubmittedToken] = useState("");
  const [message, setMessage] = useState("");

  const {
    data: invite,
    isLoading,
    isError,
  } = useGetInviteByTokenQuery(submittedToken, {
    skip: !submittedToken,
  });

  const [acceptInvite, { isLoading: isAccepting }] = useAcceptInviteMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSubmittedToken(tokenInput.trim());
  };

  const handleAccept = async () => {
    if (!submittedToken) return;
    try {
      const res = await acceptInvite(submittedToken).unwrap();
      setMessage(
        `Вы успешно присоединились к рабочему пространству! Ваша роль: ${res.role}`
      );
    } catch (err: any) {
      setMessage(
        err?.data?.message ||
          "Не удалось принять приглашение. Убедитесь, что вы вошли в свой аккаунт."
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-100">
          <MailCheck className="h-6 w-6 text-blue-500" />
          Приглашения в команду
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Проверьте код приглашения и присоединитесь к рабочему пространству коллег
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Найти приглашение по коду</CardTitle>
          <CardDescription>
            Вставьте код приглашения, который вам отправил администратор пространства
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Label className="sr-only">Код приглашения</Label>
              <Input
                placeholder="Вставьте код приглашения..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
              />
            </div>
            <Button type="submit">
              <Search className="h-4 w-4" />
              Проверить
            </Button>
          </form>
        </CardContent>
      </Card>

      {submittedToken && (
        <Card>
          <CardHeader>
            <CardTitle>Детали приглашения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-xs text-zinc-400">Поиск приглашения...</p>
            ) : isError || !invite ? (
              <p className="text-xs text-red-400">
                Приглашение с кодом «{submittedToken}» не найдено или срок его действия истёк.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-zinc-400">Получатель:</span>
                    <p className="font-medium text-zinc-100">{invite.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400">Роль в команде:</span>
                    <div className="mt-0.5">
                      <Badge>{invite.role}</Badge>
                    </div>
                  </div>
                  {invite.workspace && (
                    <div>
                      <span className="text-xs text-zinc-400">
                        Рабочее пространство:
                      </span>
                      <p className="font-medium text-zinc-100">
                        {invite.workspace.name} ({invite.workspace.slug})
                      </p>
                    </div>
                  )}
                  {invite.invited_by && (
                    <div>
                      <span className="text-xs text-zinc-400">Пригласил:</span>
                      <p className="font-medium text-zinc-100">
                        {invite.invited_by.display_name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={handleAccept} disabled={isAccepting}>
                    <CheckCircle className="h-4 w-4" />
                    {isAccepting ? "Присоединение..." : "Принять приглашение"}
                  </Button>
                  <Link href={`/invites/${submittedToken}`}>
                    <Button variant="outline">
                      Страница приглашения
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {message && (
              <p className="text-xs font-medium text-emerald-400">{message}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function InvitesLookupPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-400">
          Загрузка страницы приглашений...
        </div>
      }
    >
      <InvitesLookupContent />
    </Suspense>
  );
}
