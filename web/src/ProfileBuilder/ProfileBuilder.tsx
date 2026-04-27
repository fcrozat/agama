import React, { useState, useEffect, useCallback } from "react";
import {
  Wizard,
  WizardStep,
  WizardFooter,
  Form,
  FormGroup,
  TextInput,
  Button,
  TextArea,
  Title,
  Stack,
  StackItem,
  Radio,
  EmptyState,
  EmptyStateBody,
  Switch,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import { CopyIcon, CheckIcon } from "@patternfly/react-icons";
import { Profile } from "./types";
import StandalonePage from "./StandalonePage";
import { _ } from "~/i18n";
import { profileSchema } from "./schema";
import { SLES_PRODUCTS, OPENSUSE_PRODUCTS } from "./products";
// @ts-ignore - will be available after setup
import init, { validate_profile } from "./wasm";

const ProfileBuilder: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    product: { id: "Tumbleweed" },
    l10n: { locale: "en_US.UTF-8", timezone: "UTC" },
  });

  const [json, setJson] = useState<string>("");
  const [isModified, setIsModified] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [wasmReady, setWasmReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    init("/agama_profile_wasm_bg.wasm")
      .then(() => setWasmReady(true))
      .catch(console.error);
  }, []);

  const validate = useCallback(
    (content: string) => {
      if (wasmReady) {
        try {
          const result = validate_profile(content, JSON.stringify(profileSchema));
          setValidationErrors(result.errors);
          setIsModified(false);
        } catch (e) {
          console.error("Validation failed", e);
          const errorMessage = e instanceof Error ? e.message : String(e);
          setValidationErrors([errorMessage]);
          setIsModified(false);
        }
      }
    },
    [wasmReady],
  );

  const updateProfile = (patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  const generateJson = useCallback(() => {
    const content = JSON.stringify(profile, null, 2);
    setJson(content);
    setIsModified(false);
    validate(content);
  }, [profile, validate]);

  const handleManualEdit = (_event: React.ChangeEvent<HTMLTextAreaElement>, value: string) => {
    setJson(value);
    setIsModified(true);
  };

  const downloadFile = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "profile.json";
    a.click();
  };

  return (
    <StandalonePage title={_("Agama Profile Builder")}>
      <Wizard
        header={<Title headingLevel="h1">{_("Generate Agama Profile")}</Title>}
        onStepChange={(_event, currentStep) => {
          if (currentStep.id === "step-review") {
            generateJson();
          }
        }}
        height="100%"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        footer={(activeStep: any, onNext: any, onBack: any, onClose: any) => {
          if (!activeStep) return null;
          const isReview = activeStep.id === "step-review";
          const canDownload = json && !isModified && validationErrors.length === 0;

          return (
            <WizardFooter
              activeStep={activeStep}
              onNext={() => {
                if (isReview && canDownload) {
                  downloadFile();
                } else {
                  onNext();
                }
              }}
              onBack={onBack}
              onClose={onClose}
              nextButtonText={isReview && canDownload ? _("Download profile") : _("Next")}
              isNextDisabled={isReview && !canDownload}
              isCancelHidden
            />
          );
        }}
      >
        <WizardStep id="step-product" name={_("Product")}>
          <Form>
            <FormGroup label={_("SUSE Linux Enterprise")} fieldId="product-sles">
              {SLES_PRODUCTS.map((p) => (
                <Radio
                  key={p.id}
                  label={p.name}
                  id={p.id}
                  name="product"
                  isChecked={profile.product.id === p.id}
                  onChange={() => updateProfile({ product: { id: p.id } })}
                />
              ))}
            </FormGroup>
            <FormGroup label={_("openSUSE")} fieldId="product-opensuse">
              {OPENSUSE_PRODUCTS.map((p) => (
                <Radio
                  key={p.id}
                  label={p.name}
                  id={p.id}
                  name="product"
                  isChecked={profile.product.id === p.id}
                  onChange={() => updateProfile({ product: { id: p.id } })}
                />
              ))}
            </FormGroup>
            <FormGroup label={_("Registration Code")} fieldId="reg-code">
              <TextInput
                value={profile.product.registrationCode || ""}
                onChange={(_e, val) =>
                  updateProfile({ product: { ...profile.product, registrationCode: val } })
                }
              />
            </FormGroup>
          </Form>
        </WizardStep>

        <WizardStep id="step-system" name={_("System")}>
          <Form>
            <FormGroup label={_("Static Hostname")} fieldId="hostname-static">
              <TextInput
                value={profile.hostname?.static || ""}
                onChange={(_e, val) =>
                  updateProfile({ hostname: { ...profile.hostname, static: val } })
                }
              />
            </FormGroup>
            <Grid hasGutter>
              <GridItem span={4}>
                <FormGroup label={_("Locale")} fieldId="l10n-locale">
                  <TextInput
                    value={profile.l10n?.locale || ""}
                    onChange={(_e, val) =>
                      updateProfile({ l10n: { ...profile.l10n, locale: val } })
                    }
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={4}>
                <FormGroup label={_("Keymap")} fieldId="l10n-keymap">
                  <TextInput
                    value={profile.l10n?.keymap || ""}
                    onChange={(_e, val) =>
                      updateProfile({ l10n: { ...profile.l10n, keymap: val } })
                    }
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={4}>
                <FormGroup label={_("Timezone")} fieldId="l10n-timezone">
                  <TextInput
                    value={profile.l10n?.timezone || ""}
                    onChange={(_e, val) =>
                      updateProfile({ l10n: { ...profile.l10n, timezone: val } })
                    }
                  />
                </FormGroup>
              </GridItem>
            </Grid>
          </Form>
        </WizardStep>

        <WizardStep id="step-users" name={_("Users")}>
          <Form>
            <Title headingLevel="h3">{_("First User")}</Title>
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
            <FormGroup label={_("Password")} fieldId="user-password">
              <TextInput
                type="password"
                value={profile.user?.password || ""}
                onChange={(_e, val) => updateProfile({ user: { ...profile.user!, password: val } })}
              />
            </FormGroup>

            <Title headingLevel="h3" style={{ marginTop: "20px" }}>
              {_("Root")}
            </Title>
            <FormGroup label={_("Root Password")} fieldId="root-password">
              <TextInput
                type="password"
                value={profile.root?.password || ""}
                onChange={(_e, val) => updateProfile({ root: { ...profile.root, password: val } })}
              />
            </FormGroup>
          </Form>
        </WizardStep>

        <WizardStep id="step-software" name={_("Software")}>
          <Form>
            <FormGroup label={_("Additional Packages")} fieldId="soft-packages">
              <TextArea
                placeholder={_("vim, git, ...")}
                value={profile.software?.packages?.join(", ") || ""}
                onChange={(_e, val) =>
                  updateProfile({
                    software: {
                      ...profile.software,
                      packages: val
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s !== ""),
                    },
                  })
                }
              />
            </FormGroup>
            <FormGroup fieldId="soft-required">
              <Switch
                label={_("Only minimal hard dependencies")}
                isChecked={profile.software?.onlyRequired}
                onChange={(_e, val) =>
                  updateProfile({ software: { ...profile.software, onlyRequired: val } })
                }
              />
            </FormGroup>
          </Form>
        </WizardStep>

        <WizardStep id="step-storage" name={_("Storage")}>
          <Form>
            <FormGroup fieldId="storage-boot-config">
              <Switch
                label={_("Configure bootloader automatically")}
                isChecked={profile.storage?.boot?.configure ?? true}
                onChange={(_e, val) =>
                  updateProfile({
                    storage: {
                      ...profile.storage,
                      boot: { ...profile.storage?.boot, configure: val },
                    },
                  })
                }
              />
            </FormGroup>
            <Title headingLevel="h3">{_("Guided Partitioning")}</Title>
            <EmptyState variant="sm">
              <EmptyStateBody>
                {_(
                  "Storage configuration is highly complex. The generated profile will use default product volumes by default.",
                )}
              </EmptyStateBody>
            </EmptyState>
          </Form>
        </WizardStep>

        <WizardStep id="step-network" name={_("Network")}>
          <Form>
            <FormGroup fieldId="net-copy">
              <Switch
                label={_("Copy network configuration to target")}
                isChecked={profile.network?.state?.copyNetwork}
                onChange={(_e, val) =>
                  updateProfile({
                    network: {
                      ...profile.network,
                      state: { ...profile.network?.state, copyNetwork: val },
                    },
                  })
                }
              />
            </FormGroup>
            <Title headingLevel="h3">{_("Proxy")}</Title>
            <FormGroup fieldId="proxy-enabled">
              <Switch
                label={_("Enable Proxy")}
                isChecked={profile.proxy?.enabled}
                onChange={(_e, val) => updateProfile({ proxy: { ...profile.proxy, enabled: val } })}
              />
            </FormGroup>
            <FormGroup label={_("HTTP Proxy")} fieldId="proxy-http">
              <TextInput
                value={profile.proxy?.httpProxy || ""}
                onChange={(_e, val) =>
                  updateProfile({ proxy: { ...profile.proxy, httpProxy: val } })
                }
              />
            </FormGroup>
          </Form>
        </WizardStep>

        <WizardStep id="step-boot" name={_("Boot")}>
          <Form>
            <FormGroup label={_("Bootloader Timeout")} fieldId="boot-timeout">
              <TextInput
                type="number"
                value={profile.bootloader?.timeout?.toString() || "0"}
                onChange={(_e, val) =>
                  updateProfile({
                    bootloader: { ...profile.bootloader, timeout: parseInt(val, 10) },
                  })
                }
              />
            </FormGroup>
            <FormGroup label={_("Extra Kernel Parameters")} fieldId="boot-params">
              <TextInput
                value={profile.bootloader?.extraKernelParams || ""}
                onChange={(_e, val) =>
                  updateProfile({ bootloader: { ...profile.bootloader, extraKernelParams: val } })
                }
              />
            </FormGroup>
          </Form>
        </WizardStep>

        <WizardStep id="step-review" name={_("Review")}>
          <Stack hasGutter>
            <StackItem>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title headingLevel="h2">{_("Agama profile (JSON)")}</Title>
                <Button
                  variant="plain"
                  aria-label={_("Copy to clipboard")}
                  onClick={() => {
                    navigator.clipboard.writeText(json);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <CheckIcon color="green" /> : <CopyIcon />}
                </Button>
              </div>
              <TextArea
                id="generated-json"
                value={json}
                onChange={handleManualEdit}
                aria-label={_("Generated Profile JSON")}
                autoResize
                style={{ fontFamily: "monospace", minHeight: "300px" }}
              />
            </StackItem>
            <StackItem>
              <EmptyState
                variant="sm"
                titleText={
                  isModified
                    ? undefined
                    : validationErrors.length === 0
                      ? _("Valid Profile")
                      : _("Profile is invalid")
                }
                status={
                  isModified ? undefined : validationErrors.length === 0 ? "success" : "danger"
                }
              >
                <EmptyStateBody>
                  <Stack hasGutter>
                    {isModified && (
                      <StackItem>
                        <Button variant="primary" onClick={() => validate(json)}>
                          {_("Validate profile")}
                        </Button>
                      </StackItem>
                    )}
                    {validationErrors.length > 0 && (
                      <StackItem>
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
                      </StackItem>
                    )}
                    {!isModified && validationErrors.length === 0 && (
                      <StackItem>{_("The profile follows the official Agama schema.")}</StackItem>
                    )}
                  </Stack>
                </EmptyStateBody>
              </EmptyState>
            </StackItem>
          </Stack>
        </WizardStep>
      </Wizard>
    </StandalonePage>
  );
};

export default ProfileBuilder;
