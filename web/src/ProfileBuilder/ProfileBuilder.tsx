import React, { useState, useEffect } from "react";
import {
  Wizard,
  WizardStep,
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button,
  TextArea,
  Title,
  Stack,
  StackItem,
  Radio,
  EmptyState,
  EmptyStateBody,
} from "@patternfly/react-core";
import { Profile } from "./types";
import Page from "~/components/core/Page";
import { _ } from "~/i18n";
import { profileSchema } from "./schema";
// @ts-ignore - will be available after setup
import yamlLib from "js-yaml";
// @ts-ignore - will be available after setup
import init, { validate_profile } from "./wasm";

const ProfileBuilder: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    product: { id: "Tumbleweed" },
    l10n: { locale: "en_US.UTF-8", timezone: "UTC" },
  });

  const [yaml, setYaml] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    init("/agama_profile_wasm_bg.wasm")
      .then(() => setWasmReady(true))
      .catch(console.error);
  }, []);

  const updateProfile = (patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  const generateYaml = async () => {
    const content = yamlLib.dump(profile);
    setYaml(content);

    if (wasmReady) {
      try {
        const result = validate_profile(content, JSON.stringify(profileSchema));
        setValidationErrors(result.errors);
      } catch (e) {
        console.error("Validation failed", e);
      }
    }
  };

  return (
    <Page title={_("Agama Profile Builder")}>
      <Wizard
        header={<Title headingLevel="h1">{_("Generate Agama Profile")}</Title>}
        onClose={() => {}}
      >
        <WizardStep name={_("Product")} id="step-product">
          <Form>
            <FormGroup label={_("Target Product")} fieldId="product-id">
              <Radio
                label={_("openSUSE Tumbleweed")}
                id="tw"
                name="product"
                isChecked={profile.product.id === "Tumbleweed"}
                onChange={() => updateProfile({ product: { id: "Tumbleweed" } })}
              />
              <Radio
                label={_("openSUSE Leap 16.0")}
                id="leap"
                name="product"
                isChecked={profile.product.id === "Leap"}
                onChange={() => updateProfile({ product: { id: "Leap" } })}
              />
            </FormGroup>
          </Form>
        </WizardStep>

        <WizardStep name={_("Users")} id="step-users">
          <Form>
            <FormGroup label={_("Full Name")} isRequired fieldId="user-fullname">
              <TextInput
                isRequired
                type="text"
                id="user-fullname"
                value={profile.user?.fullName || ""}
                onChange={(_event, val) =>
                  updateProfile({
                    user: {
                      ...profile.user!,
                      fullName: val,
                      userName: profile.user?.userName || "",
                    },
                  })
                }
              />
            </FormGroup>
            <FormGroup label={_("User Name")} isRequired fieldId="user-name">
              <TextInput
                isRequired
                type="text"
                id="user-name"
                value={profile.user?.userName || ""}
                onChange={(_event, val) =>
                  updateProfile({
                    user: {
                      ...profile.user!,
                      userName: val,
                      fullName: profile.user?.fullName || "",
                    },
                  })
                }
              />
            </FormGroup>
          </Form>
        </WizardStep>

        <WizardStep name={_("Review")} id="step-review">
          <Stack hasGutter>
            <StackItem>
              <Title headingLevel="h2">{_("Generated YAML")}</Title>
              <Button onClick={generateYaml}>{_("Review & Validate")}</Button>
              <TextArea
                value={yaml}
                aria-label={_("Generated Profile YAML")}
                autoResize
                readOnly
                style={{ fontFamily: "monospace", minHeight: "300px" }}
              />
            </StackItem>
            <StackItem>
              <EmptyState
                variant="sm"
                titleText={
                  validationErrors.length === 0 ? _("Valid Profile") : _("Validation Errors")
                }
                status={validationErrors.length === 0 ? "success" : "danger"}
              >
                <EmptyStateBody>
                  {validationErrors.length === 0 ? (
                    _("The profile follows the official Agama schema.")
                  ) : (
                    <ul
                      style={{
                        textAlign: "left",
                        color: "var(--pf-t--global--color--status--danger--default)",
                      }}
                    >
                      {validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </EmptyStateBody>
              </EmptyState>
            </StackItem>
            <StackItem>
              <ActionGroup>
                <Button
                  variant="primary"
                  onClick={() => {
                    const blob = new Blob([yaml], { type: "text/yaml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "profile.yaml";
                    a.click();
                  }}
                >
                  {_("Download Profile")}
                </Button>
              </ActionGroup>
            </StackItem>
          </Stack>
        </WizardStep>
      </Wizard>
    </Page>
  );
};

export default ProfileBuilder;
