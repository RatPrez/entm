import type { Component } from "./Component";
import { toCamelCase }    from "./Utils";

export function shared<T extends abstract new (...args: any[]) => Component>(
    target: T,
    context: ClassDecoratorContext<T>
): void {
    if (typeof context.name !== "string") return;
    const sType = toCamelCase(context.name);
    (globalThis as any).__entm ??= {};
    (globalThis as any).__entm[sType] = target;
}

export function sync(mode: 'full' | 'life') {
    return function<T extends abstract new (...args: any[]) => Component>(
        target: T,
        context: ClassDecoratorContext<T>
    ): void {
        if (typeof context.name !== "string") return;
        const sType = toCamelCase(context.name);
        (target as any).sync = mode;
        (globalThis as any).__entm ??= {};
        (globalThis as any).__entm[sType] = target;
    }
}

export function ignore(_target: any, context: ClassFieldDecoratorContext): void {
    context.addInitializer(function(this: any) {
        const ctor = this.constructor;
        ctor.__ignoreFields ??= new Set();
        ctor.__ignoreFields.add(context.name);
    });
}
