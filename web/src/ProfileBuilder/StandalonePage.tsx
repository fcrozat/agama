import React from "react";
import {
  Masthead,
  MastheadMain,
  MastheadBrand,
  Page as PFPage,
  PageSection,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { _ } from "~/i18n";

interface StandalonePageProps {
  title: string;
  children: React.ReactNode;
}

const StandalonePage: React.FC<StandalonePageProps> = ({ title, children }) => {
  return (
    <PFPage
      style={{ height: "100vh" }}
      masthead={
        <Masthead>
          <MastheadMain>
            <MastheadBrand>{_("Agama Profile Builder")}</MastheadBrand>
          </MastheadMain>
          <Toolbar id="standalone-toolbar">
            <ToolbarContent>
              <ToolbarGroup align={{ default: "alignEnd" }}>
                <ToolbarItem>
                  <Title headingLevel="h1" size="lg" style={{ color: "white" }}>
                    {title}
                  </Title>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        </Masthead>
      }
    >
      <PageSection
        isFilled
        padding={{ default: "noPadding" }}
        style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {children}
      </PageSection>
    </PFPage>
  );
};

export default StandalonePage;
