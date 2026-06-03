import { Component } from "./Component";

export interface SyncEvent {
    entityId: number;
    component: Component;
}

export class SyncQueue {

// public
    addComponentSync<T extends Component>(entityId: number, component: T): T {
        if (!IsDuplicityVersion()) {
            return component;
        }

        const self = this;
        return new Proxy(component, {
            set(target, key, value) {
                target[key as keyof T] = value;
                self.trySyncComponent(entityId, target, key as string);
                return true;
            }
        });
    }

    flush(): SyncEvent[]
    {
        const events = this.queue;
        this.queue = [];
        return events;
    }

// private
    private trySyncComponent<T extends Component>(entityId: number, component: T, key: string): void {
        if (!IsDuplicityVersion()) return;
        const ctor = component.constructor as any;
        if (ctor.sync !== 'full') return;
        if (ctor.__ignoreFields?.has(key)) return;
        this.queue.push({ entityId, component });
    }

    private queue: SyncEvent[] = [];
}
