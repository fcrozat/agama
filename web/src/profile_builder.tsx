import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfileBuilder from "~/ProfileBuilder/ProfileBuilder";
import { Loading } from "~/components/layout";

/**
 * Import PF base styles before any JSX since components coming from PF may
 * import styles dependent on variables and rules previously defined there.
 */
import "@patternfly/patternfly/patternfly-base.scss";
import "@patternfly/patternfly/patternfly-addons.scss";
import "~/assets/styles/index.scss";

const queryClient = new QueryClient();
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<Loading />}>
      <ProfileBuilder />
    </Suspense>
  </QueryClientProvider>,
);
