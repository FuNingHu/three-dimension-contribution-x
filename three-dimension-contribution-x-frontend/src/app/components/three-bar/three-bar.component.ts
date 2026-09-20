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

    gripperOn = false;
    duckOn = false;

    private gripperUuid?: string;
    private duckUuid?: string;

    readonly onLanguageChange = effect(() => {
        const language = this.robotSettings()?.language;
        if (language) {
            this.translateService.use(language);
        }
        this.translateService.setDefaultLang('en');
    });

    async onGripperToggle(): Promise<void> {
        const next = !this.gripperOn;
        try {
            if (next) {
                this.gripperUuid = await this.addGripper();
            } else {
                await this.removeObject(this.gripperUuid);
                this.gripperUuid = undefined;
            }
            this.gripperOn = next;
        } catch (error) {
            console.error('Failed to toggle Robotiq 2F-85', error);
        }
        this.cd.detectChanges();
    }

    async onDuckToggle(): Promise<void> {
        const next = !this.duckOn;
        try {
            if (next) {
                this.duckUuid = await this.addDuck();
            } else {
                await this.removeObject(this.duckUuid);
                this.duckUuid = undefined;
            }
            this.duckOn = next;
        } catch (error) {
            console.error('Failed to toggle Duck', error);
        }
        this.cd.detectChanges();
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
        await this.requireSceneService().deleteObjects([uuid]);
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
