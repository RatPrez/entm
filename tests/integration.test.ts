import { describe, it, expect, beforeEach } from "vitest";
import { World } from "../src/shared/core/World";
import { System } from "../src/shared/core/System";
import { Component } from "../src/shared/core/Component";
import { Transform } from "../src/shared/components/Transform";
import { Vec3 } from "../src/shared/math/Vec3";
import type { EntityId } from "../src/shared/core/Entity";

class Velocity extends Component {
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

class MovementSystem extends System {
    override update(deltaTime: number): void {
        for (const { entityId, transform, velocity } of this.m_world.view(Transform, Velocity)) {
            transform.position = transform.position.add(
                new Vec3(
                    velocity.vx * deltaTime,
                    velocity.vy * deltaTime,
                    velocity.vz * deltaTime
                )
            );
        }
    }
}

describe("ECS Integration", () => {
    let world: World;

    beforeEach(() => {
        world = new World();
    });

    describe("complete entity lifecycle", () => {
        it("should create entity with components, update, and destroy", () => {
            const entity = world.createEntity();
            world.addComponent(entity, new Transform({
                position: new Vec3(0, 0, 0),
                rotation: new Vec3(),
                scale: new Vec3(1, 1, 1)
            }));
            world.addComponent(entity, new Velocity(10, 0, 0));

            const system = new MovementSystem(world);
            world.addSystem(system);

            const initialPos = world.getComponent(entity, Transform)!.position;
            expect(initialPos.x).toBe(0);

            world.update(1);

            const newPos = world.getComponent(entity, Transform)!.position;
            expect(newPos.x).toBe(10);

            world.destroyEntity(entity);
            expect(world.hasEntity(entity)).toBe(false);
            expect(world.getComponent(entity, Transform)).toBeNull();
        });
    });

    describe("multiple entities with systems", () => {
        it("should update all entities correctly", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();
            const e3 = world.createEntity();

            world.addComponent(e1, new Transform({
                position: new Vec3(0, 0, 0),
                rotation: new Vec3(),
                scale: new Vec3(1, 1, 1)
            }));
            world.addComponent(e1, new Velocity(1, 0, 0));

            world.addComponent(e2, new Transform({
                position: new Vec3(10, 0, 0),
                rotation: new Vec3(),
                scale: new Vec3(1, 1, 1)
            }));
            world.addComponent(e2, new Velocity(2, 0, 0));

            world.addComponent(e3, new Transform({
                position: new Vec3(20, 0, 0),
                rotation: new Vec3(),
                scale: new Vec3(1, 1, 1)
            }));

            world.addSystem(new MovementSystem(world));
            world.update(1);

            expect(world.getComponent(e1, Transform)!.position.x).toBe(1);
            expect(world.getComponent(e2, Transform)!.position.x).toBe(12);
            expect(world.getComponent(e3, Transform)!.position.x).toBe(20);
        });
    });

    describe("dynamic component addition/removal", () => {
        it("should affect view iteration", () => {
            const e1 = world.createEntity();
            const e2 = world.createEntity();

            world.addComponent(e1, new Transform({
                position: new Vec3(),
                rotation: new Vec3(),
                scale: new Vec3(1, 1, 1)
            }));
            world.addComponent(e1, new Velocity(1, 0, 0));

            world.addComponent(e2, new Transform({
                position: new Vec3(),
                rotation: new Vec3(),
                scale: new Vec3(1, 1, 1)
            }));

            const view = world.view(Transform, Velocity);
            expect([...view].length).toBe(1);

            world.addComponent(e2, new Velocity(2, 0, 0));
            expect([...view].length).toBe(2);

            world.removeComponent(e1, Velocity);
            expect([...view].length).toBe(1);
            expect([...view][0]!.entityId).toBe(e2);
        });
    });

    describe("system hooks integration", () => {
        class TrackingSystem extends System {
            entityCount = 0;
            componentCount = 0;

            override onEntityCreated(id: EntityId): void {
                this.entityCount++;
            }

            override onEntityDestroyed(id: EntityId): void {
                this.entityCount--;
            }

            override onComponentAdded(id: EntityId, sType: string): void {
                this.componentCount++;
            }

            override onComponentRemoved(id: EntityId, sType: string): void {
                this.componentCount--;
            }
        }

        it("should track entity and component counts", () => {
            const system = new TrackingSystem(world);
            world.addSystem(system);

            const e1 = world.createEntity();
            expect(system.entityCount).toBe(1);

            world.addComponent(e1, new Transform({
                position: new Vec3(),
                rotation: new Vec3(),
                scale: new Vec3(1, 1, 1)
            }));
            expect(system.componentCount).toBe(1);

            world.addComponent(e1, new Velocity(0, 0, 0));
            expect(system.componentCount).toBe(2);

            world.removeComponent(e1, Velocity);
            expect(system.componentCount).toBe(1);

            world.destroyEntity(e1);
            expect(system.entityCount).toBe(0);
        });
    });

    describe("complex scene simulation", () => {
        it("should handle multiple updates over time", () => {
            const entities: EntityId[] = [];

            for (let i = 0; i < 10; i++) {
                const e = world.createEntity();
                world.addComponent(e, new Transform({
                    position: new Vec3(i * 10, 0, 0),
                    rotation: new Vec3(),
                    scale: new Vec3(1, 1, 1)
                }));
                world.addComponent(e, new Velocity(i, 0, 0));
                entities.push(e);
            }

            world.addSystem(new MovementSystem(world));

            for (let frame = 0; frame < 60; frame++) {
                world.update(1 / 60);
            }

            for (let i = 0; i < 10; i++) {
                const pos = world.getComponent(entities[i]!, Transform)!.position;
                expect(pos.x).toBeCloseTo(i * 10 + i * 1, 5);
            }
        });
    });

    describe("system ordering", () => {
        class FirstSystem extends System {
            calls: number[] = [];
            override update(): void {
                this.calls.push(1);
            }
        }

        class SecondSystem extends System {
            calls: number[] = [];
            override update(): void {
                this.calls.push(2);
            }
        }

        it("should execute systems in registration order", () => {
            const first = new FirstSystem(world);
            const second = new SecondSystem(world);

            world.addSystem(first);
            world.addSystem(second);

            world.update(0.016);

            expect(first.calls).toEqual([1]);
            expect(second.calls).toEqual([2]);
        });
    });

    describe("view performance with large entity count", () => {
        it("should efficiently iterate 1000 entities", () => {
            for (let i = 0; i < 1000; i++) {
                const e = world.createEntity();
                world.addComponent(e, new Transform({
                    position: new Vec3(i, 0, 0),
                    rotation: new Vec3(),
                    scale: new Vec3(1, 1, 1)
                }));
                if (i % 2 === 0) {
                    world.addComponent(e, new Velocity(1, 0, 0));
                }
            }

            const view = world.view(Transform, Velocity);
            let count = 0;
            for (const _ of view) {
                count++;
            }

            expect(count).toBe(500);
        });
    });
});
