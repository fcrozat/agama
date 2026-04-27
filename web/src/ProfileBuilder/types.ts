export interface Profile {
  product: {
    id: string;
    registrationCode?: string;
  };
  software?: {
    mandatory_patterns?: string[];
    optional_patterns?: string[];
    user_patterns?: string[];
    mandatory_packages?: string[];
  };
  security?: {
    lsm?: "selinux" | "apparmor" | "none";
  };
  user?: {
    fullName: string;
    userName: string;
    password?: string;
  };
  root?: {
    password?: string;
  };
  l10n?: {
    locale?: string;
    keymap?: string;
    timezone?: string;
  };
  storage?: {
    volumes?: string[];
    boot_strategy?: string;
  };
}
