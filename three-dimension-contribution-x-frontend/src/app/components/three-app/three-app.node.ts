import { ApplicationNode } from '@universal-robots/contribution-api';

export interface ThreeAppNode extends ApplicationNode {
  type: string;
  version: string;
}
