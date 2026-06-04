import { describe, it, expect, beforeEach } from "vitest";
import { Component } from "../src/shared/core/Component";
import { sync, shared } from "../src/shared/core/Decorators";

describe("Decorators", () => {
    beforeEach(() => {
        // Clear globalThis.__entm before each test
        (globalThis as any).__entm = {};
    });

    describe("shared()", () => {
        it("should register component in globalThis.__entm with camelCase name", () => {
            class TestComponent extends Component {}

            shared(TestComponent, { kind: 'class', name: 'TestComponent' } as any);

            expect((globalThis as any).__entm).toHaveProperty("testComponent");
            expect((globalThis as any).__entm.testComponent).toBe(TestComponent);
        });

        it("should handle single-letter class names", () => {
            class C extends Component {}

            shared(C, { kind: 'class', name: 'C' } as any);

            expect((globalThis as any).__entm).toHaveProperty("c");
            expect((globalThis as any).__entm.c).toBe(C);
        });

        it("should convert PascalCase to camelCase", () => {
            class MyLongComponentName extends Component {}

            shared(MyLongComponentName, { kind: 'class', name: 'MyLongComponentName' } as any);

            expect((globalThis as any).__entm).toHaveProperty("myLongComponentName");
            expect((globalThis as any).__entm.myLongComponentName).toBe(MyLongComponentName);
        });
    });

    describe("sync()", () => {
        it("should register component with 'life' sync mode", () => {
            class LifeComponent extends Component {}

            sync('life')(LifeComponent, { kind: 'class', name: 'LifeComponent' } as any);

            expect((globalThis as any).__entm).toHaveProperty("lifeComponent");
            expect((globalThis as any).__entm.lifeComponent).toBe(LifeComponent);
            expect((LifeComponent as any).sync).toBe('life');
        });

        it("should register component with 'full' sync mode", () => {
            class FullComponent extends Component {}

            sync('full')(FullComponent, { kind: 'class', name: 'FullComponent' } as any);

            expect((globalThis as any).__entm).toHaveProperty("fullComponent");
            expect((globalThis as any).__entm.fullComponent).toBe(FullComponent);
            expect((FullComponent as any).sync).toBe('full');
        });

        it("should use camelCase registration key", () => {
            class NetworkedEntity extends Component {}

            sync('life')(NetworkedEntity, { kind: 'class', name: 'NetworkedEntity' } as any);

            expect((globalThis as any).__entm).toHaveProperty("networkedEntity");
            expect((globalThis as any).__entm.networkedEntity).toBe(NetworkedEntity);
        });

        it("should set sync property on constructor", () => {
            class SyncTest extends Component {}

            sync('life')(SyncTest, { kind: 'class', name: 'SyncTest' } as any);

            expect((SyncTest as any).sync).toBe('life');
        });
    });

    describe("mixed registration", () => {
        it("should allow both shared and sync components", () => {
            class SharedComp extends Component {}
            class SyncComp extends Component {}

            shared(SharedComp, { kind: 'class', name: 'SharedComp' } as any);
            sync('life')(SyncComp, { kind: 'class', name: 'SyncComp' } as any);

            expect((globalThis as any).__entm.sharedComp).toBe(SharedComp);
            expect((globalThis as any).__entm.syncComp).toBe(SyncComp);
        });
    });

    describe("runtime lookup", () => {
        it("should find component by sType", () => {
            class Virus extends Component {}

            sync('life')(Virus, { kind: 'class', name: 'Virus' } as any);

            const instance = new Virus();
            const sType = instance.sType; // should be "virus"

            expect(sType).toBe("virus");
            expect((globalThis as any).__entm[sType]).toBe(Virus);
        });

        it("should match sType with decorator registration", () => {
            class Position extends Component {}

            shared(Position, { kind: 'class', name: 'Position' } as any);

            const instance = new Position();
            const ctor = (globalThis as any).__entm[instance.sType];

            expect(ctor).toBe(Position);
            expect(instance).toBeInstanceOf(ctor);
        });
    });
});
