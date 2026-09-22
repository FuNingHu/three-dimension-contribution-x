import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, InputSignal } from '@angular/core';
import { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
    controllerPose,
    RobotSettings,
    SidebarItemPresenter,
    SidebarPresenterAPI,
    zUpPositionMeters,
    zUpRotationVectorRadians,
} from '@universal-robots/contribution-api';
import { TranslateService } from '@ngx-translate/core';
import { PATH } from '../../../generated/contribution-constants';
import { getSceneModelUuid, isSceneModelOn, SceneModelId, setSceneModelUuid } from './scene-model-registry';

interface SignalSidebarItemPresenter extends Omit<SidebarItemPresenter, 'robotSettings' | 'presenterAPI'> {
    robotSettings: InputSignal<RobotSettings | undefined>;
    presenterAPI: InputSignal<SidebarPresenterAPI | undefined>;
}

@Component({
    templateUrl: './three-bar.component.html',
    styleUrls: ['./three-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ThreeBarComponent implements SignalSidebarItemPresenter {
    protected readonly translateService = inject(TranslateService);
    private readonly cd = inject(ChangeDetectorRef);

    readonly robotSettings = input<RobotSettings | undefined>();
    readonly presenterAPI = input<SidebarPresenterAPI | undefined>();

    gripperOn = isSceneModelOn('gripper');
    duckOn = isSceneModelOn('duck');

    readonly onLanguageChange = effect(() => {
        const language = this.robotSettings()?.language;
        if (language) {
            this.translateService.use(language);
        }
        this.translateService.setDefaultLang('en');
    });

    async onGripperToggle(): Promise<void> {
        await this.toggleModel('gripper', this.addGripper.bind(this));
        this.gripperOn = isSceneModelOn('gripper');
        this.cd.detectChanges();
    }

    async onDuckToggle(): Promise<void> {
        await this.toggleModel('duck', this.addDuck.bind(this));
        this.duckOn = isSceneModelOn('duck');
        this.cd.detectChanges();
    }

    private async toggleModel(id: SceneModelId, add: () => Promise<string>): Promise<void> {
        try {
            if (isSceneModelOn(id)) {
                await this.removeObject(getSceneModelUuid(id));
                setSceneModelUuid(id, undefined);
                return;
            }
            setSceneModelUuid(id, await add());
        } catch (error) {
            console.error(`Failed to toggle ${id}`, error);
        }
    }

    private async addGripper(): Promise<string> {
        const scene = await this.loadGltf(`${PATH}/assets/gltfs/Robotiq2F85.gltf`);
        scene.rotation.x = -Math.PI / 2;
        scene.updateMatrixWorld(true);

        const poseOnFlange = controllerPose(
            zUpPositionMeters(0, 0, 0),
            zUpRotationVectorRadians(0, 0, 0),
            'flange'
        );
        await this.requireSceneService().addNewObjectAtPose(scene, poseOnFlange);
        await this.requireSceneService().attachToolToFlange(scene.uuid, poseOnFlange);
        return scene.uuid;
    }

    private async addDuck(): Promise<string> {
        const scene = await this.loadGltf(`${PATH}/assets/gltfs/Duck.gltf`);
        scene.scale.setScalar(0.5);
        scene.updateMatrixWorld(true);

        await this.requireSceneService().addNewObjectAtPose(scene, {
            objectPosition: zUpPositionMeters(0, 0.5, 0),
            objectRotation: zUpRotationVectorRadians(Math.PI / 2, 0, 0),
            referenceFrame: 'world'
        });
        return scene.uuid;
    }

    private async removeObject(uuid?: string): Promise<void> {
        if (!uuid) {
            return;
        }
        try {
            await this.requireSceneService().deleteObjects([uuid]);
        } catch (error) {
            console.warn('Failed to delete scene object', uuid, error);
        }
    }

    private async loadGltf(url: string): Promise<Object3D> {
        const gltf = await new GLTFLoader().loadAsync(url);
        return gltf.scene;
    }

    private requireSceneService() {
        const sceneService = this.presenterAPI()?.sceneService;
        if (!sceneService) {
            throw new Error('SceneService is not available');
        }
        return sceneService;
    }
}
