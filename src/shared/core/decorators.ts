import type { Component } from "./Component";

export function shared<T extends abstract new (...args: any[]) => Component>(
    target: T,
    context: ClassDecoratorContext<T>
): void {
    if (typeof context.name !== "string") return;
    (globalThis as any).__entm ??= {};
    (globalThis as any).__entm[context.name] = target;
}
