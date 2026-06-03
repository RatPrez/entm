import { describe, it, expect, beforeEach } from "vitest";
import { World } from "../src/shared/core/World";
import { View } from "../src/shared/core/View";
import { Component } from "../src/shared/core/Component";
import type { EntityId } from "../src/shared/core/Entity";

class CompA extends Component {
    a: number;
    constructor(a: number) {
        super();
        this.a = a;
    }
}

class CompB extends Component {
    b: string;
    constructor(b: string) {
        super();
        this.b = b;
    }
}

class CompC extends Component {
    c: boolean;
    constructor(c: boolean) {
        super();
        this.c = c;
    }
}

describe("View", () => {
    let world: World;

    beforeEach(() => {
        world = new World();
    });

    describe("single component view", () => {
        it("should iterate entities with component", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            world.addComponent(e1, new CompA(10));
            world.addComponent(e2, new CompA(20));

            const view = new View(world, CompA);
            const results = [...view];
            expect(results.length).toBe(2);
            expect(results[0]!.entityId).toBe(e1);
            expect(results[0]!.compA.a).toBe(10);
            expect(results[1]!.entityId).toBe(e2);
            expect(results[1]!.compA.a).toBe(20);
        });

        it("should return empty for non-existent components", () => {
            const view = new View(world, CompA);
            const results = [...view];
            expect(results.length).toBe(0);
        });

        it("should skip entities without component", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            world.addComponent(e1, new CompA(10));
            world.addComponent(e2, new CompB("test"));

            const view = new View(world, CompA);
            const results = [...view];
            expect(results.length).toBe(1);
            expect(results[0]!.entityId).toBe(e1);
        });
    });

    describe("multi-component view", () => {
        it("should iterate entities with all components", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            const e3 = world.createEntity();
            world.addComponent(e1, new CompA(10));
            world.addComponent(e1, new CompB("one"));
            world.addComponent(e2, new CompA(20));
            world.addComponent(e2, new CompB("two"));
            world.addComponent(e3, new CompA(30));

            const view = new View(world, CompA, CompB);
            const results = [...view];
            expect(results.length).toBe(2);
            expect(results[0]!.compA.a).toBe(10);
            expect(results[0]!.compB.b).toBe("one");
            expect(results[1]!.compA.a).toBe(20);
            expect(results[1]!.compB.b).toBe("two");
        });

        it("should skip entities missing any component", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            const e3 = world.createEntity();
            world.addComponent(e1, new CompA(1));
            world.addComponent(e2, new CompB("test"));
            world.addComponent(e3, new CompA(3));
            world.addComponent(e3, new CompB("ok"));

            const view = new View(world, CompA, CompB);
            const results = [...view];
            expect(results.length).toBe(1);
            expect(results[0]!.entityId).toBe(e3);
        });

        it("should handle three component view", () => {
            const e1 = world.createEntity();
            world.addComponent(e1, new CompA(1));
            world.addComponent(e1, new CompB("test"));
            world.addComponent(e1, new CompC(true));

            const view = new View(world, CompA, CompB, CompC);
            const results = [...view];
            expect(results.length).toBe(1);
            expect(results[0]!.compA.a).toBe(1);
            expect(results[0]!.compB.b).toBe("test");
            expect(results[0]!.compC.c).toBe(true);
        });
    });

    describe("each method", () => {
        it("should invoke callback for each result", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            world.addComponent(e1, new CompA(10));
            world.addComponent(e2, new CompA(20));

            const view = new View(world, CompA);
            const visited: EntityId[] = [];
            view.each((result) => {
                visited.push(result.entityId);
            });
            expect(visited).toEqual([e1, e2]);
        });

        it("should provide component access in callback", () => {
            const e1 = world.createEntity();
            world.addComponent(e1, new CompA(42));

            const view = new View(world, CompA);
            let sum = 0;
            view.each((result) => {
                sum += result.compA.a;
            });
            expect(sum).toBe(42);
        });
    });

    describe("dynamic updates", () => {
        it("should reflect component additions", () => {
            const view = new View(world, CompA);
            expect([...view].length).toBe(0);

            const e1 = world.createEntity();
            world.addComponent(e1, new CompA(10));
            expect([...view].length).toBe(1);
        });

        it("should reflect component removals", () => {
            const e1 = world.createEntity();
            world.addComponent(e1, new CompA(10));

            const view = new View(world, CompA);
            expect([...view].length).toBe(1);

            world.removeComponent(e1, CompA);
            expect([...view].length).toBe(0);
        });

        it("should reflect entity destruction", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            world.addComponent(e1, new CompA(10));
            world.addComponent(e2, new CompA(20));

            const view = new View(world, CompA);
            expect([...view].length).toBe(2);

            world.destroyEntity(e1);
            const results = [...view];
            expect(results.length).toBe(1);
            expect(results[0]!.entityId).toBe(e2);
        });
    });

    describe("component key mapping", () => {
        it("should use camelCase sType as property key", () => {
            const e1 = world.createEntity();
            world.addComponent(e1, new CompA(10));

            const view = new View(world, CompA);
            const result = [...view][0]!;
            expect(result).toHaveProperty("compA");
            expect(result.compA).toBeInstanceOf(CompA);
        });

        it("should provide correct keys for multiple components", () => {
            const e1 = world.createEntity();
            world.addComponent(e1, new CompA(1));
            world.addComponent(e1, new CompB("test"));

            const view = new View(world, CompA, CompB);
            const result = [...view][0]!;
            expect(result).toHaveProperty("compA");
            expect(result).toHaveProperty("compB");
        });
    });

    describe("empty pools", () => {
        it("should handle missing primary pool", () => {
            const view = new View(world, CompA);
            const results = [...view];
            expect(results.length).toBe(0);
        });

        it("should handle missing secondary pool", () => {
            const e1 = world.createEntity();
            world.addComponent(e1, new CompA(10));

            const view = new View(world, CompA, CompB);
            const results = [...view];
            expect(results.length).toBe(0);
        });
    });
});
