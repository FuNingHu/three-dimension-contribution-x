import {ChangeDetectionStrategy, ChangeDetectorRef, Component, input, InputSignal, OnChanges, SimpleChanges} from '@angular/core';
import {
  RobotSettings,
  SidebarItemPresenter,
  SidebarPresenterAPI
} from '@universal-robots/contribution-api';
import {TranslateService} from "@ngx-translate/core";
import {first} from "rxjs";


interface SignalSidebarItemPresenter
  extends Omit<SidebarItemPresenter, "robotSettings" | "presenterAPI"> {
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

  readonly robotSettings = input<RobotSettings | undefined>();
  readonly presenterAPI = input<SidebarPresenterAPI | undefined>();
}
