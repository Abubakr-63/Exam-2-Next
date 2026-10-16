// Простая функция для объединения CSS-классов Tailwind (стандарт shadcn/ui).
// Работает даже если clsx или tailwind-merge ещё не установлены.
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
