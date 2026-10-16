"use client";

import React, { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MailCheck, CheckCircle } from "lucide-react";
import { useGetInviteByTokenQuery, useAcceptInviteMutation } from "@/store/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function InviteByTokenContent() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const [message, setMessage] = useState("");

  const { data: invite, isLoading, isError } = useGetInviteByTokenQuery(token);
  const [acceptInvite, { isLoading: isAccepting }] = useAcceptInviteMutation();

  const handleAccept = async () => {
    try {
      await acceptInvite(token).unwrap();
      setMessage("Приглашение принято! Переходим в рабочее пространство...");
      if (invite?.workspace?.slug) {
        router.push(`/workspaces/${invite.workspace.slug}`);
      }
    } catch (err: any) {
      setMessage(
        err?.data?.message ||
          "Не удалось принять приглашение. Сначала войдите в аккаунт."
      );
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailCheck className="h-5 w-5 text-blue-500" />
            Приглашение в рабочее пространство
          </CardTitle>
          <CardDescription>Код приглашения: {token}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-xs text-zinc-400">Проверка приглашения...</p>
          ) : isError || !invite ? (
            <p className="text-xs text-red-400">
              Приглашение не найдено или срок его действия истёк.
            </p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                <p>
                  <span className="text-zinc-400">Команда:</span>{" "}
                  <strong>{invite.workspace?.name || invite.workspace_id}</strong>
                </p>
                <p>
                  <span className="text-zinc-400">Email:</span>{" "}
                  <strong>{invite.email}</strong>
                </p>
                <p>
                  <span className="text-zinc-400">Роль:</span>{" "}
                  <Badge>{invite.role}</Badge>
                </p>
              </div>
              <Button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4" />
                {isAccepting ? "Присоединение..." : "Принять приглашение"}
              </Button>
            </div>
          )}
          {message && (
            <p className="text-xs font-medium text-blue-400">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InviteByTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-400">
          Загрузка приглашения...
        </div>
      }
    >
      <InviteByTokenContent />
    </Suspense>
  );
}
