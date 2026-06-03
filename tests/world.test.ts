import { describe, it, expect, beforeEach, vi } from "vitest";
import { World } from "../src/shared/core/World";
import { System } from "../src/shared/core/System";
import { Component } from "../src/shared/core/Component";
import type { EntityId } from "../src/shared/core/Entity";

class PositionComponent extends Component {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class VelocityComponent extends Component {
    vx: number;
    vy: number;
    vz: number;
    constructor(vx: number, vy: number, vz: number) {
        super();
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
    }
}

describe("World", () => {
    let world: World;

    beforeEach(() => {
        world = new World();
    });

    describe("entity management", () => {
        it("should create entity with sequential IDs", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            const e3 = world.createEntity();
            expect(e1).toBe(0);
            expect(e2).toBe(1);
            expect(e3).toBe(2);
        });

        it("should track entity count", () => {
            expect(world.getEntityCount()).toBe(0);
            world.createEntity();
            expect(world.getEntityCount()).toBe(1);
            world.createEntity();
            expect(world.getEntityCount()).toBe(2);
        });

        it("should validate entity existence", () => {
            const id = world.createEntity();
            expect(world.hasEntity(id)).toBe(true);
            expect(world.hasEntity(999)).toBe(false);
        });

        it("should destroy entity", () => {
            const id = world.createEntity();
            expect(world.hasEntity(id)).toBe(true);
            world.destroyEntity(id);
            expect(world.hasEntity(id)).toBe(false);
            expect(world.getEntityCount()).toBe(0);
        });

        it("should reuse destroyed entity IDs", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            world.destroyEntity(e1);
            const e3 = world.createEntity();
            expect(e3).toBe(e1);
        });

        it("should remove all components when entity destroyed", () => {
            const id = world.createEntity();
            world.addComponent(id, new PositionComponent(1, 2, 3));
            world.addComponent(id, new VelocityComponent(0, 0, 0));
            world.destroyEntity(id);
            const newId = world.createEntity();
            expect(world.getComponent(newId, PositionComponent)).toBeNull();
            expect(world.getComponent(newId, VelocityComponent)).toBeNull();
        });
    });

    describe("component management", () => {
        it("should add and retrieve component", () => {
            const id = world.createEntity();
            const pos = new PositionComponent(10, 20, 30);
            world.addComponent(id, pos);
            const retrieved = world.getComponent(id, PositionComponent);
            expect(retrieved).toBe(pos);
            expect(retrieved?.x).toBe(10);
        });

        it("should return null for non-existent component", () => {
            const id = world.createEntity();
            expect(world.getComponent(id, PositionComponent)).toBeNull();
        });

        it("should handle multiple components on same entity", () => {
            const id = world.createEntity();
            const pos = new PositionComponent(1, 2, 3);
            const vel = new VelocityComponent(4, 5, 6);
            world.addComponent(id, pos);
            world.addComponent(id, vel);
            expect(world.getComponent(id, PositionComponent)).toBe(pos);
            expect(world.getComponent(id, VelocityComponent)).toBe(vel);
        });

        it("should return existing component on duplicate add", () => {
            const id = world.createEntity();
            const pos1 = new PositionComponent(1, 2, 3);
            const pos2 = new PositionComponent(4, 5, 6);
            const result1 = world.addComponent(id, pos1);
            const result2 = world.addComponent(id, pos2);
            expect(result1).toBe(pos1);
            expect(result2).toBe(pos1);
        });

        it("should remove component", () => {
            const id = world.createEntity();
            world.addComponent(id, new PositionComponent(1, 2, 3));
            world.removeComponent(id, PositionComponent);
            expect(world.getComponent(id, PositionComponent)).toBeNull();
        });

        it("should handle remove of non-existent component", () => {
            const id = world.createEntity();
            world.removeComponent(id, PositionComponent);
            expect(world.getComponent(id, PositionComponent)).toBeNull();
        });

        it("should access component pool", () => {
            const id1 = world.createEntity();
            const id2 = world.createEntity();
            world.addComponent(id1, new PositionComponent(1, 2, 3));
            world.addComponent(id2, new PositionComponent(4, 5, 6));
            const pool = world.getPool(PositionComponent);
            expect(pool).not.toBeNull();
            expect(pool?.size()).toBe(2);
        });

        it("should return null pool for non-existent component type", () => {
            expect(world.getPool(PositionComponent)).toBeNull();
        });
    });

    describe("view", () => {
        it("should iterate single component", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            world.addComponent(e1, new PositionComponent(1, 2, 3));
            world.addComponent(e2, new PositionComponent(4, 5, 6));

            const results: EntityId[] = [];
            for (const result of world.view(PositionComponent)) {
                results.push(result.entityId);
                expect(result.positionComponent).toBeDefined();
            }
            expect(results).toContain(e1);
            expect(results).toContain(e2);
            expect(results.length).toBe(2);
        });

        it("should iterate multiple components", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            const e3 = world.createEntity();
            world.addComponent(e1, new PositionComponent(1, 2, 3));
            world.addComponent(e1, new VelocityComponent(0, 0, 0));
            world.addComponent(e2, new PositionComponent(4, 5, 6));
            world.addComponent(e3, new VelocityComponent(1, 1, 1));

            const results: EntityId[] = [];
            for (const result of world.view(PositionComponent, VelocityComponent)) {
                results.push(result.entityId);
                expect(result.positionComponent).toBeDefined();
                expect(result.velocityComponent).toBeDefined();
            }
            expect(results).toEqual([e1]);
        });

        it("should return empty for non-existent component", () => {
            const results = [...world.view(PositionComponent)];
            expect(results.length).toBe(0);
        });

        it("should provide each method", () => {
            const e1 = world.createEntity();
            world.addComponent(e1, new PositionComponent(1, 2, 3));

            const visited: EntityId[] = [];
            world.view(PositionComponent).each((result) => {
                visited.push(result.entityId);
            });
            expect(visited).toEqual([e1]);
        });
    });

    describe("system management", () => {
        class TestSystem extends System {
            updateCalls = 0;
            fixedUpdateCalls = 0;
            startCalled = false;
            endCalled = false;

            override update(deltaTime: number): void {
                this.updateCalls++;
            }

            override updateFixed(fixedTime: number): void {
                this.fixedUpdateCalls++;
            }

            override onStart(): void {
                this.startCalled = true;
            }

            override onEnd(): void {
                this.endCalled = true;
            }
        }

        it("should add system and call onStart", () => {
            const system = new TestSystem(world);
            world.addSystem(system);
            expect(system.startCalled).toBe(true);
        });

        it("should call update on registered systems", () => {
            const system = new TestSystem(world);
            world.addSystem(system);
            world.update(0.016);
            expect(system.updateCalls).toBe(1);
            world.update(0.016);
            expect(system.updateCalls).toBe(2);
        });

        it("should call updateFixed on registered systems", () => {
            const system = new TestSystem(world);
            world.addSystem(system);
            world.updateFixed(0.016);
            expect(system.fixedUpdateCalls).toBe(1);
        });

        it("should retrieve system by constructor", () => {
            const system = new TestSystem(world);
            world.addSystem(system);
            const retrieved = world.getSystem(TestSystem);
            expect(retrieved).toBe(system);
        });

        it("should return null for non-existent system", () => {
            expect(world.getSystem(TestSystem)).toBeNull();
        });

        it("should remove system and call onEnd", () => {
            const system = new TestSystem(world);
            world.addSystem(system);
            world.removeSystem(TestSystem);
            expect(system.endCalled).toBe(true);
            expect(world.getSystem(TestSystem)).toBeNull();
        });

        it("should not call update after system removed", () => {
            const system = new TestSystem(world);
            world.addSystem(system);
            world.update(0.016);
            const beforeRemove = system.updateCalls;
            world.removeSystem(TestSystem);
            world.update(0.016);
            expect(system.updateCalls).toBe(beforeRemove);
        });
    });

    describe("system hooks", () => {
        class HookTestSystem extends System {
            entityCreatedIds: EntityId[] = [];
            entityDestroyedIds: EntityId[] = [];
            componentsAdded: Array<{ id: EntityId; sType: string }> = [];
            componentsRemoved: Array<{ id: EntityId; sType: string }> = [];

            override onEntityCreated(id: EntityId): void {
                this.entityCreatedIds.push(id);
            }

            override onEntityDestroyed(id: EntityId): void {
                this.entityDestroyedIds.push(id);
            }

            override onComponentAdded(id: EntityId, sType: string): void {
                this.componentsAdded.push({ id, sType });
            }

            override onComponentRemoved(id: EntityId, sType: string): void {
                this.componentsRemoved.push({ id, sType });
            }
        }

        it("should notify on entity creation", () => {
            const system = new HookTestSystem(world);
            world.addSystem(system);
            const id = world.createEntity();
            expect(system.entityCreatedIds).toContain(id);
        });

        it("should notify on entity destruction", () => {
            const system = new HookTestSystem(world);
            world.addSystem(system);
            const id = world.createEntity();
            world.destroyEntity(id);
            expect(system.entityDestroyedIds).toContain(id);
        });

        it("should notify on component added", () => {
            const system = new HookTestSystem(world);
            world.addSystem(system);
            const id = world.createEntity();
            world.addComponent(id, new PositionComponent(1, 2, 3));
            expect(system.componentsAdded).toContainEqual({ id, sType: "positionComponent" });
        });

        it("should notify on component removed", () => {
            const system = new HookTestSystem(world);
            world.addSystem(system);
            const id = world.createEntity();
            world.addComponent(id, new PositionComponent(1, 2, 3));
            world.removeComponent(id, PositionComponent);
            expect(system.componentsRemoved).toContainEqual({ id, sType: "positionComponent" });
        });
    });

    describe("error handling", () => {
        class ErrorSystem extends System {
            override update(deltaTime: number): void {
                throw new Error("Update error");
            }

            override updateFixed(fixedTime: number): void {
                throw new Error("Fixed update error");
            }
        }

        it("should catch update errors and continue", () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const system = new ErrorSystem(world);
            world.addSystem(system);
            expect(() => world.update(0.016)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Update error"));
            consoleSpy.mockRestore();
        });

        it("should catch updateFixed errors and continue", () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const system = new ErrorSystem(world);
            world.addSystem(system);
            expect(() => world.updateFixed(0.016)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Fixed update error"));
            consoleSpy.mockRestore();
        });
    });
});
