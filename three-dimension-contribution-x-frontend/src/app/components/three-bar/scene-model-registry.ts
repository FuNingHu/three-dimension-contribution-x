export type SceneModelId = 'gripper' | 'duck';

/**
 * Lives as long as the URCap frontend bundle — across sidebar hide/show —
 * and is cleared with the 3D view on page refresh or URCap reinstall.
 */
const uuids: Partial<Record<SceneModelId, string>> = {};

export function getSceneModelUuid(id: SceneModelId): string | undefined {
    return uuids[id];
}

export function setSceneModelUuid(id: SceneModelId, uuid: string | undefined): void {
    if (uuid) {
        uuids[id] = uuid;
    } else {
        delete uuids[id];
    }
}

export function isSceneModelOn(id: SceneModelId): boolean {
    return !!uuids[id];
}
