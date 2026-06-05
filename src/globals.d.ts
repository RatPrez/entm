declare function on(event: string, callback: (...args: any[]) => void): void;
declare function onNet(event: string, callback: (...args: any[]) => void): void;
declare function emitNet(eventName: string, ...args?: any): void;
declare function emit(eventName: string, ...args?: any): void;
declare function getPlayers(): number[];
declare function TriggerClientEvent(event: string, target: number, ...args: ang[]): void;
declare function GetCurrentResourceName(): string;
declare function IsDuplicityVersion(): boolean;
declare function GetPlayerName(source: number): string;
declare function GetPlayerServerId(player: number): number;
declare var source: number
