import { describe, it, expect, beforeEach } from "vitest";
import { System } from "../src/shared/core/System";
import { World } from "../src/shared/core/World";
import type { EntityId } from "../src/shared/core/Entity";

describe("System", () => {
    let world: World;

    beforeEach(() => {
        world = new World();
    });

    describe("construction", () => {
        it("should construct with world reference", () => {
            const system = new System(world);
            expect(system["m_world"]).toBe(world);
        });
    });

    describe("lifecycle hooks", () => {
        it("should have default no-op update", () => {
            const system = new System(world);
            expect(() => system.update(0.016)).not.toThrow();
        });

        it("should have default no-op updateFixed", () => {
            const system = new System(world);
            expect(() => system.updateFixed(0.016)).not.toThrow();
        });

        it("should have default no-op onStart", () => {
            const system = new System(world);
            expect(() => system.onStart()).not.toThrow();
        });

        it("should have default no-op onEnd", () => {
            const system = new System(world);
            expect(() => system.onEnd()).not.toThrow();
        });

        it("should have default no-op onEntityCreated", () => {
            const system = new System(world);
            expect(() => system.onEntityCreated(0)).not.toThrow();
        });

        it("should have default no-op onEntityDestroyed", () => {
            const system = new System(world);
            expect(() => system.onEntityDestroyed(0)).not.toThrow();
        });

        it("should have default no-op onComponentAdded", () => {
            const system = new System(world);
            expect(() => system.onComponentAdded(0, "test")).not.toThrow();
        });

        it("should have default no-op onComponentRemoved", () => {
            const system = new System(world);
            expect(() => system.onComponentRemoved(0, "test")).not.toThrow();
        });
    });

    describe("hook flags", () => {
        it("should initialize all flags to false", () => {
            const system = new System(world);
            expect(system.m_hasUpdate).toBe(false);
            expect(system.m_hasFixedUpdate).toBe(false);
            expect(system.m_hasOnStart).toBe(false);
            expect(system.m_hasOnEnd).toBe(false);
            expect(system.m_hasOnEntityCreated).toBe(false);
            expect(system.m_hasOnEntityDestroyed).toBe(false);
            expect(system.m_hasOnComponentAdded).toBe(false);
            expect(system.m_hasOnComponentRemoved).toBe(false);
        });
    });

    describe("custom implementations", () => {
        class CustomSystem extends System {
            updateCalls = 0;
            fixedUpdateCalls = 0;
            createdEntities: EntityId[] = [];
            lastDeltaTime = 0;

            override update(deltaTime: number): void {
                this.updateCalls++;
                this.lastDeltaTime = deltaTime;
            }

            override updateFixed(fixedTime: number): void {
                this.fixedUpdateCalls++;
            }

            override onEntityCreated(id: EntityId): void {
                this.createdEntities.push(id);
            }
        }

        it("should allow update override", () => {
            const system = new CustomSystem(world);
            system.update(0.016);
            expect(system.updateCalls).toBe(1);
            expect(system.lastDeltaTime).toBe(0.016);
        });

        it("should allow updateFixed override", () => {
            const system = new CustomSystem(world);
            system.updateFixed(0.016);
            expect(system.fixedUpdateCalls).toBe(1);
        });

        it("should allow onEntityCreated override", () => {
            const system = new CustomSystem(world);
            system.onEntityCreated(42);
            expect(system.createdEntities).toContain(42);
        });

        it("should access world from system", () => {
            class WorldAccessSystem extends System {
                getEntityCount(): number {
                    return this.m_world.getEntityCount();
                }
            }

            const system = new WorldAccessSystem(world);
            world.createEntity();
            world.createEntity();
            expect(system.getEntityCount()).toBe(2);
        });
    });

    describe("integration with World", () => {
        it("should be callable when registered to world", () => {
            class TestSystem extends System {
                calls = 0;
                override update(): void {
                    this.calls++;
                }
            }

            const system = new TestSystem(world);
            world.addSystem(system);
            world.update(0.016);
            expect(system.calls).toBe(1);
        });

        it("should receive entity lifecycle events", () => {
            class ListenerSystem extends System {
                created: EntityId[] = [];
                destroyed: EntityId[] = [];

                override onEntityCreated(id: EntityId): void {
                    this.created.push(id);
                }

                override onEntityDestroyed(id: EntityId): void {
                    this.destroyed.push(id);
                }
            }

            const system = new ListenerSystem(world);
            world.addSystem(system);

            const e1 = world.createEntity();
            const e2 = world.createEntity();
            world.destroyEntity(e1);

            expect(system.created).toEqual([e1, e2]);
            expect(system.destroyed).toEqual([e1]);
        });
    });
});
