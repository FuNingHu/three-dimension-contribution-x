import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
    ApplicationPresenterAPI,
    ApplicationPresenter,
    RobotSettings,
    zUpPositionMeters,
    zUpRotationVectorRadians,
} from '@universal-robots/contribution-api';
import { ThreeAppNode } from './three-app.node';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PATH } from '../../../generated/contribution-constants';

@Component({
    templateUrl: './three-app.component.html',
    styleUrls: ['./three-app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ThreeAppComponent implements ApplicationPresenter, OnChanges {
    // applicationAPI is optional
    @Input() applicationAPI: ApplicationPresenterAPI;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;
    // applicationNode is required
    @Input() applicationNode: ThreeAppNode;

    private gltfsLoaded = false;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.robotSettings) {
            if (!changes?.robotSettings?.currentValue) {
                return;
            }

            if (changes?.robotSettings?.isFirstChange()) {
                if (changes?.robotSettings?.currentValue) {
                    this.translateService.use(changes?.robotSettings?.currentValue?.language);
                }
                this.translateService.setDefaultLang('en');
            }

            this.translateService
                .use(changes?.robotSettings?.currentValue?.language)
                .pipe(first())
                .subscribe(() => {
                    this.cd.detectChanges();
                });

            void this.loadAndPlaceGltfs();
        }
    }

    private async loadAndPlaceGltfs(): Promise<void> {
        if (this.gltfsLoaded || !this.applicationAPI?.sceneService) {
            return;
        }
        this.gltfsLoaded = true;

        const loader = new GLTFLoader();
        const duckUrl = `${PATH}/assets/gltfs/Duck.gltf`;

        try {
            const gltfDuck = await loader.loadAsync(duckUrl);

            // Scale to 50% of native size.
            gltfDuck.scene.scale.setScalar(0.5);

            const poseDuck = {
                objectPosition: zUpPositionMeters(0, 0.5, 0),
                // Khronos Duck is Y-up; rotate +90° around X so it stands
                // upright in the Z-up world frame.
                objectRotation: zUpRotationVectorRadians(Math.PI / 2, 0, 0),
                referenceFrame: 'world',
            };

            this.applicationAPI.sceneService.addNewObjectAtPose(gltfDuck.scene, poseDuck);
        } catch (error) {
            this.gltfsLoaded = false;
            console.error('Failed to load gltf assets', error);
        }
    }

    // call saveNode to save node parameters
    saveNode() {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }
}
