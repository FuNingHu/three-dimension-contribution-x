import {ComponentFixture, TestBed} from '@angular/core/testing';
import { ThreeAppComponent} from "./ThreeApp.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('ThreeAppComponent', () => {
  let fixture: ComponentFixture<ThreeAppComponent>;
  let component: ThreeAppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThreeAppComponent],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader, useValue: {
            getTranslation(): Observable<Record<string, string>> {
              return of({});
            }
          }
        }
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(ThreeAppComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
