import type { Component } from "./Component";

export function shared<T extends abstract new (...args: any[]) => Component>(
    target: T,
    context: ClassDecoratorContext<T>
): void {
    if (typeof context.name !== "string") return;
    (globalThis as any).__entm ??= {};
    (globalThis as any).__entm[context.name] = target;
}

export function sync(mode: 'full' | 'life') {
    return function<T extends abstract new (...args: any[]) => Component>(
        target: T,
        context: ClassDecoratorContext<T>
    ): void {
        if (typeof context.name !== "string") return;
        (target as any).sync = mode;
        (globalThis as any).__entm ??= {};
        (globalThis as any).__entm[context.name] = target;
    }
}

export function ignore(_target: any, context: ClassFieldDecoratorContext): void {
    context.addInitializer(function(this: any) {
        const ctor = this.constructor;
        ctor.__ignoreFields ??= new Set();
        ctor.__ignoreFields.add(context.name);
    });
}
