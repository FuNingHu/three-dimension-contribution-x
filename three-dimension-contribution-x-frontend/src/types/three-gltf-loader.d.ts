declare module 'three/examples/jsm/loaders/GLTFLoader' {
    import { Loader, Group, AnimationClip, Camera } from 'three';

    export interface GLTF {
        scene: Group;
        scenes: Group[];
        animations: AnimationClip[];
        cameras: Camera[];
        asset: { copyright?: string; generator?: string; version?: string; minVersion?: string; extensions?: unknown; extras?: unknown };
        parser: unknown;
        userData: Record<string, unknown>;
    }

    export class GLTFLoader extends Loader {
        constructor(manager?: unknown);
        load(
            url: string,
            onLoad: (gltf: GLTF) => void,
            onProgress?: (event: ProgressEvent) => void,
            onError?: (event: ErrorEvent) => void
        ): void;
        loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<GLTF>;
        parse(
            data: ArrayBuffer | string,
            path: string,
            onLoad: (gltf: GLTF) => void,
            onError?: (event: ErrorEvent) => void
        ): void;
    }
}
