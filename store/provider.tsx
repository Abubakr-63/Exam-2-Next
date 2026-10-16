"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";

// Клиентский провайдер Redux + защита от ошибок пререндера Next.js 16 (Date.now / useParams / usePathname)
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Provider store={store}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">
            Загрузка приложения...
          </div>
        }
      >
        {mounted ? (
          children
        ) : (
          <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
            Загрузка...
          </div>
        )}
      </Suspense>
    </Provider>
  );
}
