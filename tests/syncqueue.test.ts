import { describe, it, expect, beforeEach, vi } from "vitest";
import { SyncQueue } from "../src/shared/core/SyncQueue";
import { Component } from "../src/shared/core/Component";

class SyncComponent extends Component {
    static sync = 'full';
    value: number;
    name: string;

    constructor(value: number, name: string) {
        super();
        this.value = value;
        this.name = name;
    }
}

class NoSyncComponent extends Component {
    static sync = 'none';
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }
}

class IgnoreFieldComponent extends Component {
    static sync = 'full';
    static __ignoreFields = new Set(['ignored']);
    tracked: number;
    ignored: number;

    constructor(tracked: number, ignored: number) {
        super();
        this.tracked = tracked;
        this.ignored = ignored;
    }
}

describe("SyncQueue", () => {
    let queue: SyncQueue;

    beforeEach(() => {
        queue = new SyncQueue();
        vi.clearAllMocks();
    });

    describe("addComponentSync", () => {
        it("should return proxy for full-sync component in duplicity", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp = new SyncComponent(42, "test");
            const result = queue.addComponentSync(1, comp);

            expect(result).not.toBe(comp);
            expect(result.value).toBe(42);
            expect(result.name).toBe("test");
        });

        it("should return original component when not in duplicity", () => {
            global.IsDuplicityVersion = vi.fn(() => false);
            const comp = new SyncComponent(42, "test");
            const result = queue.addComponentSync(1, comp);

            expect(result).toBe(comp);
        });

        it("should queue sync events when proxy properties are set", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp = new SyncComponent(10, "initial");
            const proxy = queue.addComponentSync(5, comp);

            proxy.value = 20;
            proxy.name = "updated";

            const events = queue.flush();
            expect(events).toHaveLength(2);
            expect(events[0].entityId).toBe(5);
            expect(events[0].component).toBe(comp);
            expect(events[1].entityId).toBe(5);
            expect(events[1].component).toBe(comp);
        });

        it("should not queue sync events for non-sync components", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp = new NoSyncComponent(42);
            const proxy = queue.addComponentSync(3, comp);

            proxy.value = 100;

            const events = queue.flush();
            expect(events).toHaveLength(0);
        });

        it("should not queue sync events for ignored fields", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp = new IgnoreFieldComponent(10, 20);
            const proxy = queue.addComponentSync(7, comp);

            proxy.ignored = 999;

            const events = queue.flush();
            expect(events).toHaveLength(0);
        });

        it("should queue sync events for tracked fields but not ignored fields", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp = new IgnoreFieldComponent(10, 20);
            const proxy = queue.addComponentSync(7, comp);

            proxy.tracked = 50;
            proxy.ignored = 999;

            const events = queue.flush();
            expect(events).toHaveLength(1);
            expect(events[0].entityId).toBe(7);
            expect(events[0].component.tracked).toBe(50);
        });

        it("should update underlying component when proxy is modified", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp = new SyncComponent(10, "test");
            const proxy = queue.addComponentSync(2, comp);

            proxy.value = 999;
            proxy.name = "changed";

            expect(comp.value).toBe(999);
            expect(comp.name).toBe("changed");
        });
    });

    describe("flush", () => {
        it("should return empty array when queue is empty", () => {
            const events = queue.flush();
            expect(events).toEqual([]);
        });

        it("should return all queued events", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp1 = new SyncComponent(10, "a");
            const comp2 = new SyncComponent(20, "b");

            const proxy1 = queue.addComponentSync(1, comp1);
            const proxy2 = queue.addComponentSync(2, comp2);

            proxy1.value = 11;
            proxy2.value = 22;
            proxy1.name = "updated";

            const events = queue.flush();
            expect(events).toHaveLength(3);
            expect(events[0].entityId).toBe(1);
            expect(events[1].entityId).toBe(2);
            expect(events[2].entityId).toBe(1);
        });

        it("should clear queue after flush", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp = new SyncComponent(42, "test");
            const proxy = queue.addComponentSync(5, comp);

            proxy.value = 100;

            const events1 = queue.flush();
            expect(events1).toHaveLength(1);

            const events2 = queue.flush();
            expect(events2).toHaveLength(0);
        });

        it("should allow new events to be queued after flush", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp = new SyncComponent(1, "test");
            const proxy = queue.addComponentSync(3, comp);

            proxy.value = 10;
            queue.flush();

            proxy.value = 20;
            const events = queue.flush();

            expect(events).toHaveLength(1);
            expect(events[0].component.value).toBe(20);
        });
    });

    describe("trySyncComponent behavior", () => {
        it("should handle multiple property updates on same entity", () => {
            global.IsDuplicityVersion = vi.fn(() => true);
            const comp = new SyncComponent(0, "");
            const proxy = queue.addComponentSync(10, comp);

            for (let i = 0; i < 5; i++) {
                proxy.value = i;
            }

            const events = queue.flush();
            expect(events).toHaveLength(5);
            expect(comp.value).toBe(4);
        });

        it("should handle sync events from multiple entities", () => {
            global.IsDuplicityVersion = vi.fn(() => true);

            const entities = Array.from({ length: 10 }, (_, i) => ({
                id: i,
                comp: new SyncComponent(i, `entity-${i}`)
            }));

            const proxies = entities.map(e => queue.addComponentSync(e.id, e.comp));

            proxies.forEach(p => p.value = 999);

            const events = queue.flush();
            expect(events).toHaveLength(10);
            expect(new Set(events.map(e => e.entityId)).size).toBe(10);
        });
    });
});
