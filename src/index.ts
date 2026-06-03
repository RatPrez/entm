// ========================================
// Core ECS
// ========================================

export { Component }                    from "./shared/core/Component";
export { shared }                       from "./shared/core/Decorators";
export type { EntityId }                from "./shared/core/Entity";
export { ComponentPool }                from "./shared/core/ComponentPool";
export type { IComponentPool }          from "./shared/core/ComponentPool";
export { World }                        from "./shared/core/World";
export { System }                       from "./shared/core/System";
export { View }                         from "./shared/core/View";
export type { ViewResult }              from "./shared/core/View";
export { Profiler }                     from "./shared/core/Profiler";
export type { ProfileStat }             from "./shared/core/Profiler";

// ========================================
// Components - Shared
// ========================================

export { Entity }                       from "./shared/components/Entity";
export { CfxEntity }                    from "./shared/components/CfxEntity";
export { Transform }                    from "./shared/components/Transform";

// ========================================
// Components - Client Only
// ========================================

export { CPed }                         from "./client/components/CPed";
export { CVehicle }                     from "./client/components/CVehicle";

// ========================================
// Components - Server Only
// ========================================

export { SPed }                         from "./server/components/SPed";
export { SVehicle }                     from "./server/components/SVehicle";

// ========================================
// Math
// ========================================

export { Vec3 }                         from "./shared/math/Vec3";
