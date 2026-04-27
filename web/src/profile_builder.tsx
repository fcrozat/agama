import React from "react";
import { createRoot } from "react-dom/client";
import ProfileBuilder from "~/ProfileBuilder/ProfileBuilder";

/**
 * Import PF base styles before any JSX since components coming from PF may
 * import styles dependent on variables and rules previously defined there.
 */
import "@patternfly/patternfly/patternfly-base.scss";
import "@patternfly/patternfly/patternfly-addons.scss";
import "~/assets/styles/index.scss";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<ProfileBuilder />);
