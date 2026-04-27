export interface Profile {
  product: {
    id: string;
    mode?: string;
    registrationCode?: string;
    registrationEmail?: string;
    registrationUrl?: string;
    addons?: Array<{
      id: string;
      version?: string;
      registrationCode?: string;
    }>;
  };
  hostname?: {
    static?: string;
    transient?: string;
  };
  l10n?: {
    locale?: string;
    keymap?: string;
    timezone?: string;
  };
  user?: {
    fullName: string;
    userName: string;
    password: string;
    hashedPassword?: boolean;
    sshPublicKey?: string | string[];
    sshPublicKeys?: string | string[];
  };
  root?: {
    password?: string;
    hashedPassword?: boolean;
    sshPublicKey?: string | string[];
    sshPublicKeys?: string | string[];
  };
  bootloader?: {
    stopOnBootMenu?: boolean;
    timeout?: number;
    extraKernelParams?: string;
    updateNvram?: boolean;
  };
  proxy?: {
    enabled?: boolean;
    httpProxy?: string;
    httpsProxy?: string;
    ftpProxy?: string;
    gopherProxy?: string;
    socksProxy?: string;
    socks5Server?: string;
    noProxy?: string;
  };
  software?: {
    patterns?: string[] | { add?: string[]; remove?: string[] };
    packages?: string[];
    onlyRequired?: boolean;
    extraRepositories?: Array<{
      alias?: string;
      url?: string;
      priority?: number;
      name?: string;
      enabled?: boolean;
      allowUnsigned?: boolean;
      gpgFingerprints?: string[];
    }>;
  };
  security?: {
    sslCertificates?: Array<{
      fingerprint: string;
      algorithm: "SHA1" | "SHA256";
    }>;
  };
  network?: {
    state?: {
      copyNetwork?: boolean;
      networkingEnabled?: boolean;
      wirelessEnabled?: boolean;
    };
    connections?: unknown[];
  };
  storage?: {
    boot?: { configure: boolean; device?: string };
    drives?: unknown[];
    volumeGroups?: unknown[];
    mdRaids?: unknown[];
  };
  iscsi?: {
    initiator?: string;
    targets?: unknown[];
  };
  dasd?: {
    devices?: unknown[];
  };
  zfcp?: {
    controllers?: string[];
    devices?: unknown[];
  };
  scripts?: {
    pre?: unknown[];
    postPartitioning?: unknown[];
    post?: unknown[];
    init?: unknown[];
  };
  files?: unknown[];
  questions?: {
    policy?: "auto" | "user";
    answers?: unknown[];
  };
}
