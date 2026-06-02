import {
  registerSidebarBehavior,
  SidebarItemBehaviors,
} from "@universal-robots/contribution-api";

const behaviors: SidebarItemBehaviors = {
  factory: () => {
    return {
      type: "funh-three-dimension-contribution-x-three-bar",
      version: "1.0.0",
    };
  },
};

registerSidebarBehavior(behaviors);
