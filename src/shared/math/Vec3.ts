export class Vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static fromArray(coords: number[]): Vec3 {
        return new Vec3(coords[0] ?? 0, coords[1] ?? 0, coords[2] ?? 0);
    }

    static zero(): Vec3 {
        return new Vec3(0, 0, 0);
    }

    static one(): Vec3 {
        return new Vec3(1, 1, 1);
    }

    add(other: Vec3): Vec3 {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    sub(other: Vec3): Vec3 {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    scale(s: number): Vec3 {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }

    dot(other: Vec3): number {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross(other: Vec3): Vec3 {
        return new Vec3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize(): Vec3 {
        const len = this.length();
        if (len === 0) return Vec3.zero();
        return this.scale(1 / len);
    }

    distance(other: Vec3): number {
        return this.sub(other).length();
    }

    clone(): Vec3 {
        return new Vec3(this.x, this.y, this.z);
    }

    toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }
}
