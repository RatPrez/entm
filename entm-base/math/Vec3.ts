export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export const vec3Add   = (a: Vec3, b: Vec3): Vec3  => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const vec3Sub   = (a: Vec3, b: Vec3): Vec3  => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const vec3Scale = (a: Vec3, s: number): Vec3 => ({ x: a.x * s,   y: a.y * s,   z: a.z * s });
export const vec3Len   = (a: Vec3): number          => Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);

export function vec3(coords: number[]): Vec3;
export function vec3(x?: number, y?: number, z?: number): Vec3;
export function vec3(xOrCoords: number[] | number = 0, y = 0, z = 0): Vec3 {
    if (Array.isArray(xOrCoords)) {
        return { x: xOrCoords[0] ?? 0, y: xOrCoords[1] ?? 0, z: xOrCoords[2] ?? 0 };
    }
    return { x: xOrCoords, y, z };
}
