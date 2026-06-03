import { describe, it, expect, beforeEach } from "vitest";
import { ComponentPool } from "../src/shared/core/ComponentPool";
import { Component } from "../src/shared/core/Component";
import type { EntityId } from "../src/shared/core/Entity";

class TestComponent extends Component {
    value: number;
    constructor(value: number) {
        super();
        this.value = value;
    }
}

describe("ComponentPool", () => {
    let pool: ComponentPool<TestComponent>;

    beforeEach(() => {
        pool = new ComponentPool<TestComponent>();
    });

    describe("emplace", () => {
        it("should insert component and return it", () => {
            const comp = new TestComponent(42);
            const result = pool.emplace(0, comp);
            expect(result).toBe(comp);
            expect(result.value).toBe(42);
        });

        it("should return existing component if already present", () => {
            const comp1 = new TestComponent(10);
            const comp2 = new TestComponent(20);
            pool.emplace(0, comp1);
            const result = pool.emplace(0, comp2);
            expect(result).toBe(comp1);
            expect(result.value).toBe(10);
        });

        it("should expand sparse array for large entity IDs", () => {
            const comp = new TestComponent(99);
            pool.emplace(1000, comp);
            expect(pool.has(1000)).toBe(true);
            expect(pool.get(1000)?.value).toBe(99);
        });

        it("should handle multiple entities", () => {
            pool.emplace(0, new TestComponent(10));
            pool.emplace(5, new TestComponent(20));
            pool.emplace(10, new TestComponent(30));
            expect(pool.size()).toBe(3);
            expect(pool.get(0)?.value).toBe(10);
            expect(pool.get(5)?.value).toBe(20);
            expect(pool.get(10)?.value).toBe(30);
        });
    });

    describe("get", () => {
        it("should return null for non-existent entity", () => {
            expect(pool.get(0)).toBeNull();
        });

        it("should return null for entity ID beyond sparse bounds", () => {
            expect(pool.get(9999)).toBeNull();
        });

        it("should retrieve existing component", () => {
            const comp = new TestComponent(777);
            pool.emplace(5, comp);
            expect(pool.get(5)).toBe(comp);
        });
    });

    describe("has", () => {
        it("should return false for non-existent entity", () => {
            expect(pool.has(0)).toBe(false);
        });

        it("should return false for entity ID beyond sparse bounds", () => {
            expect(pool.has(9999)).toBe(false);
        });

        it("should return true for existing entity", () => {
            pool.emplace(7, new TestComponent(1));
            expect(pool.has(7)).toBe(true);
        });
    });

    describe("removeById", () => {
        it("should do nothing for non-existent entity", () => {
            pool.removeById(999);
            expect(pool.size()).toBe(0);
        });

        it("should remove single component", () => {
            pool.emplace(0, new TestComponent(1));
            pool.removeById(0);
            expect(pool.has(0)).toBe(false);
            expect(pool.size()).toBe(0);
        });

        it("should swap last element when removing middle", () => {
            pool.emplace(0, new TestComponent(10));
            pool.emplace(1, new TestComponent(20));
            pool.emplace(2, new TestComponent(30));
            pool.removeById(1);
            expect(pool.size()).toBe(2);
            expect(pool.has(0)).toBe(true);
            expect(pool.has(1)).toBe(false);
            expect(pool.has(2)).toBe(true);
            expect(pool.get(2)?.value).toBe(30);
        });

        it("should maintain correct mapping after swap", () => {
            const ids: EntityId[] = [10, 20, 30, 40];
            for (let i = 0; i < ids.length; i++) {
                pool.emplace(ids[i]!, new TestComponent(i * 100));
            }
            pool.removeById(20);
            expect(pool.size()).toBe(3);
            expect(pool.has(10)).toBe(true);
            expect(pool.has(20)).toBe(false);
            expect(pool.has(30)).toBe(true);
            expect(pool.has(40)).toBe(true);
        });
    });

    describe("clear", () => {
        it("should clear empty pool", () => {
            pool.clear();
            expect(pool.size()).toBe(0);
        });

        it("should clear all components", () => {
            pool.emplace(0, new TestComponent(1));
            pool.emplace(1, new TestComponent(2));
            pool.emplace(2, new TestComponent(3));
            pool.clear();
            expect(pool.size()).toBe(0);
            expect(pool.has(0)).toBe(false);
            expect(pool.has(1)).toBe(false);
            expect(pool.has(2)).toBe(false);
        });
    });

    describe("iteration accessors", () => {
        it("should provide size", () => {
            expect(pool.size()).toBe(0);
            pool.emplace(0, new TestComponent(1));
            expect(pool.size()).toBe(1);
            pool.emplace(1, new TestComponent(2));
            expect(pool.size()).toBe(2);
        });

        it("should access entities by index", () => {
            pool.emplace(10, new TestComponent(1));
            pool.emplace(20, new TestComponent(2));
            expect(pool.entityAt(0)).toBe(10);
            expect(pool.entityAt(1)).toBe(20);
        });

        it("should access components by index", () => {
            const comp1 = new TestComponent(100);
            const comp2 = new TestComponent(200);
            pool.emplace(0, comp1);
            pool.emplace(1, comp2);
            expect(pool.at(0)).toBe(comp1);
            expect(pool.at(1)).toBe(comp2);
        });
    });
});

describe("Component", () => {
    it("should compute sType from class name", () => {
        class MyComponent extends Component {}
        const comp = new MyComponent();
        expect(comp.sType).toBe("myComponent");
    });

    it("should handle single-letter class names", () => {
        class C extends Component {}
        const comp = new C();
        expect(comp.sType).toBe("c");
    });

    it("should preserve camelCase for multi-word names", () => {
        class VeryLongComponentName extends Component {}
        const comp = new VeryLongComponentName();
        expect(comp.sType).toBe("veryLongComponentName");
    });
});
