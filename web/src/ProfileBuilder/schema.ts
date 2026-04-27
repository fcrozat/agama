export const profileSchema = {
  $schema: "https://json-schema.org/draft/2019-09/schema",
  $id: "https://github.com/agama-project/agama/blob/master/rust/agama-lib/share/profile.schema.json",
  title: "Profile",
  description: "Profile definition for automated installation",
  type: "object",
  additionalProperties: false,
  properties: {
    $schema: {
      title: "URL of the JSON validation schema",
      description:
        "The schema location is ignored by the installer, it always uses the built-in schema, but it can be useful for automatic validation and code completion in some editors",
      type: "string",
      examples: [
        "https://raw.githubusercontent.com/agama-project/agama/refs/heads/SLE-16/rust/agama-lib/share/profile.schema.json",
        "https://raw.githubusercontent.com/agama-project/agama/refs/heads/master/rust/agama-lib/share/profile.schema.json",
      ],
    },
    files: {
      title: "User-defined files to deploy",
      description:
        "User-defined files to deploy after installation just before post install scripts",
      type: "array",
      items: {
        $ref: "#/$defs/file",
      },
    },
    scripts: {
      title: "User-defined installation scripts",
      description: "User-defined scripts to run at different points of the installation",
      type: "object",
      additionalProperties: false,
      properties: {
        pre: {
          title: "Pre-installation scripts",
          description: "User-defined scripts to run before the installation starts",
          type: "array",
          items: {
            $ref: "#/$defs/preScript",
          },
        },
        postPartitioning: {
          title: "Post-partitioning scripts",
          description: "User-defined scripts to run after the partitioning finishes",
          type: "array",
          items: {
            $ref: "#/$defs/postPartitioning",
          },
        },
        post: {
          title: "Post-installation scripts",
          description: "User-defined scripts to run after the installation finishes",
          type: "array",
          items: {
            $ref: "#/$defs/postScript",
          },
        },
        init: {
          title: "Init scripts",
          description: "User-defined scripts to run booting the installed system",
          type: "array",
          items: {
            $ref: "#/$defs/initScript",
          },
        },
      },
    },
    bootloader: {
      title: "Bootloader settings",
      type: "object",
      properties: {
        stopOnBootMenu: {
          title: "Specify if bootloader should stop on menu during boot.",
          type: "boolean",
        },
        timeout: {
          title: "Specify how long bootloader should wait on menu before going with default entry.",
          type: "integer",
          minimum: 0,
        },
        extraKernelParams: {
          title:
            "Specify additional kernel parameters that are added beside ones added by the installer.",
          type: "string",
        },
        updateNvram: {
          title: "Specify if bootloader should update persistent RAM (NVRAM).",
          type: "boolean",
        },
      },
      oneOf: [
        {
          required: ["stopOnBootMenu"],
        },
        {
          required: ["timeout"],
        },
        {
          not: {
            anyOf: [
              {
                required: ["stopOnBootMenu"],
              },
              {
                required: ["timeout"],
              },
            ],
          },
        },
      ],
    },
    dasd: {
      $ref: "#/$defs/dasd",
    },
    zfcp: {
      $ref: "#/$defs/zfcp",
    },
    hostname: {
      title: "Hostname settings",
      type: "object",
      properties: {
        static: {
          title: "System static hostname.",
          type: "string",
        },
        transient: {
          title: "System transient hostname.",
          type: "string",
        },
      },
    },
    proxy: {
      title: "Proxy settings",
      type: "object",
      properties: {
        enabled: {
          title: "Whether the proxy is enabled or not.",
          type: "boolean",
        },
        httpProxy: {
          description: "URL to be used for the HTTP proxy.",
          type: "string",
          examples: ["http://proxy.provider.de:3128/"],
        },
        httpsProxy: {
          description: "URL to be used for the HTTPS proxy.",
          type: "string",
        },
        ftpProxy: {
          type: "string",
        },
        gopherProxy: {
          description: "URL to be used for the Gopher proxy.",
          type: "string",
        },
        socksProxy: {
          description: "URL to be used for the SOCKS proxy.",
          type: "string",
        },
        socks5Server: {
          description: "SOCKS5 server address",
          type: "string",
          examples: ["office-proxy.example.com:8881"],
        },
        noProxy: {
          title: "Hosts that do not need a proxy for being reach",
          type: "string",
        },
      },
    },
    security: {
      title: "Security settings",
      type: "object",
      properties: {
        sslCertificates: {
          title: "List of SSL certificates to add to system",
          type: "array",
          items: {
            type: "object",
            properties: {
              fingerprint: {
                title: "fingerprint of ssl certificate",
                type: "string",
                examples: ["A8:DE:08:B1:57:52:FE:70:DF:D5:31:EA:E3:53:BB:39:EE:01:FF:B9"],
              },
              algorithm: {
                title: "Fingerprint algorithm used to compute it",
                type: "string",
                enum: ["SHA1", "SHA256"],
                examples: ["SHA1"],
              },
            },
            required: ["fingerprint", "algorithm"],
          },
        },
      },
    },
    software: {
      $ref: "#/$defs/software",
    },
    questions: {
      title: "How to handle Agama questions",
      type: "object",
      additionalProperties: false,
      properties: {
        policy: {
          title: "Policy to answer questions",
          description: "Ask questions to the user or select the default value",
          type: "string",
          enum: ["auto", "user"],
          default: "user",
        },
        answers: {
          title: "Pre-defined answer for a matching question",
          type: "array",
          items: {
            $ref: "#/$defs/answer",
          },
        },
      },
    },
    product: {
      title: "Product to install",
      type: "object",
      additionalProperties: false,
      required: ["id"],
      properties: {
        id: {
          title: "Product identifier",
          description: "The id field from a products.d/foo.yaml file",
          type: "string",
          examples: [
            "Kalpa",
            "MicroOS",
            "openSUSE_Leap_Micro",
            "openSUSE_Leap",
            "SLES_SAP",
            "SLES",
            "Slowroll",
            "Tumbleweed",
          ],
        },
        mode: {
          description: "The mode from the products.d/foo.yaml file",
          type: "string",
        },
        registrationCode: {
          description: "Product registration code",
          type: "string",
        },
        registrationEmail: {
          description: "Product registration email",
          type: "string",
        },
        registrationUrl: {
          description: "URL of the registration server",
          type: "string",
        },
        addons: {
          title: "List of add-ons to activate",
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id"],
            properties: {
              id: {
                title: "Add-on identifier",
                type: "string",
                examples: ["sle-ha"],
              },
              version: {
                title: "Version of the add-on",
                description: "It is mandatory if there are multiple available versions",
                type: "string",
              },
              registrationCode: {
                title: "Add-on registration code",
                type: "string",
              },
            },
          },
        },
      },
    },
    network: {
      title: "Network settings",
      type: "object",
      additionalProperties: false,
      properties: {
        state: {
          title: "Network general settings",
          type: "object",
          properties: {
            connectivity: {
              title: "Whether the user is able to access the Internet",
              type: "boolean",
              readOnly: true,
            },
            copyNetwork: {
              title: "Whether the network configuration should be copied to the target system",
              type: "boolean",
            },
            networkingEnabled: {
              title: "Whether the network should be enabled",
              type: "boolean",
            },
            wirelessEnabled: {
              title: "Whether the wireless should be enabled",
              type: "boolean",
            },
          },
        },
        connections: {
          title: "Network connections to be defined",
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id"],
            properties: {
              id: {
                title: "Connection ID",
                type: "string",
              },
              interface: {
                title: "The name of the network interface bound to this connection",
                type: "string",
              },
              customMacAddress: {
                title: "Custom MAC address to use",
                description: "Can also be 'preserve', 'permanent', 'random' or 'stable'.",
                type: "string",
              },
              macAddress: {
                title: "The MAC address of the interface bound to this connection",
                type: "string",
              },
              mtu: {
                description: "Connection MTU",
                type: "integer",
                minimum: 0,
              },
              method4: {
                title: "IPv4 configuration method",
                type: "string",
                enum: ["auto", "manual", "link-local", "disabled"],
              },
              method6: {
                title: "IPv6 configuration method",
                type: "string",
                enum: ["auto", "manual", "link-local", "disabled"],
              },
              gateway4: {
                title: "Connection gateway address",
                type: "string",
                examples: ["192.168.122.1"],
              },
              gateway6: {
                title: "Connection gateway address",
                type: "string",
                examples: ["::ffff:c0a8:7a01"],
              },
              addresses: {
                type: "array",
                items: {
                  title: "Connection addresses",
                  type: "string",
                },
              },
              nameservers: {
                type: "array",
                items: {
                  title: "Nameservers",
                  description: "IPv4 and/or IPv6 are allowed.",
                  type: "string",
                },
              },
              dnsSearchList: {
                type: "array",
                items: {
                  description: "DNS search domains",
                  type: "string",
                },
              },
              dnsSearchlist: {
                type: "array",
                items: {
                  description: "DNS search domains",
                  type: "string",
                },
                deprecated: true,
              },
              ignoreAutoDns: {
                description: "Whether DNS options provided via DHCP are used or not",
                type: "boolean",
              },
              status: {
                title: "Connection status",
                description: "The status of the connection",
                type: "string",
                enum: ["up", "down", "keep", "removed"],
              },
              autoconnect: {
                title: "Auto-connected",
                description: "Whether the connection should be automatically connected",
                type: "boolean",
              },
              persistent: {
                title: "Persistent",
                description: "Whether the connection should be written to disk permanently",
                type: "boolean",
              },
              wireless: {
                type: "object",
                title: "Wireless configuration",
                additionalProperties: false,
                properties: {
                  password: {
                    title: "Password of the wireless network",
                    type: "string",
                  },
                  security: {
                    title: "Security method/key management",
                    type: "string",
                    enum: [
                      "none",
                      "owe",
                      "ieee8021x",
                      "wpa-psk",
                      "sae",
                      "wpa-eap",
                      "wpa-eap-suite-b-192",
                    ],
                  },
                  ssid: {
                    title: "SSID of the wireless network",
                    type: "string",
                  },
                  mode: {
                    title: "Wireless network mode",
                    type: "string",
                    enum: ["infrastructure", "adhoc", "mesh", "ap"],
                  },
                  hidden: {
                    title: "Indicates that the wireless network is not broadcasting its SSID",
                    type: "boolean",
                  },
                  band: {
                    title: "Frequency band of the wireless network",
                    type: "string",
                    enum: ["a", "bg"],
                  },
                  channel: {
                    title: "Wireless channel of the wireless network",
                    type: "integer",
                    minimum: 0,
                  },
                  bssid: {
                    title: "Only allow connection to this mac address",
                    type: "string",
                  },
                  groupAlgorithms: {
                    type: "array",
                    items: {
                      title: "A list of group/broadcast encryption algorithms",
                      type: "string",
                      enum: ["wep40", "wep104", "tkip", "ccmp"],
                    },
                  },
                  pairwiseAlgorithms: {
                    type: "array",
                    items: {
                      title: "A list of pairwise encryption algorithms",
                      type: "string",
                      enum: ["tkip", "ccmp"],
                    },
                  },
                  wpaProtocolVersions: {
                    type: "array",
                    items: {
                      title: "A list of allowed WPA protocol versions",
                      type: "string",
                      enum: ["wpa", "rsn"],
                    },
                  },
                  pmf: {
                    title:
                      "Indicates whether Protected Management Frames must be enabled for the connection",
                    type: "integer",
                  },
                },
              },
              bond: {
                type: "object",
                title: "Bonding configuration",
                additionalProperties: false,
                properties: {
                  mode: {
                    type: "string",
                    enum: [
                      "balance-rr",
                      "active-backup",
                      "balance-xor",
                      "broadcast",
                      "802.3ad",
                      "balance-tlb",
                      "balance-alb",
                    ],
                  },
                  options: {
                    type: "string",
                  },
                  ports: {
                    type: "array",
                    items: {
                      title: "A list of the interfaces or connections to be bonded",
                      type: "string",
                    },
                  },
                },
              },
              bridge: {
                type: "object",
                title: "Bridge configuration",
                additionalProperties: false,
                properties: {
                  stp: {
                    title: "whether the Spanning Tree Protocol is enabled or not",
                    type: "boolean",
                  },
                  forwardDelay: {
                    title: "Spanning Tree Protocol forward delay, in seconds",
                    type: "integer",
                    minimum: 0,
                  },
                  priority: {
                    title: "Spanning Tree Protocol priority (lower values are 'better')",
                    type: "integer",
                    minimum: 0,
                  },
                  maxAge: {
                    title: "Spanning Tree Protocol maximum message age, in seconds",
                    type: "integer",
                    minimum: 0,
                  },
                  helloTime: {
                    title: "Spanning Tree Protocol hello time, in seconds",
                    type: "integer",
                    minimum: 0,
                  },
                  ports: {
                    type: "array",
                    items: {
                      title: "A list of the interface(s) or connection(s) to be part of the bridge",
                      type: "string",
                    },
                  },
                },
              },
              match: {
                type: "object",
                title: "Match settings",
                description: "Identifies the network interface to apply the connection settings to",
                additionalProperties: false,
                properties: {
                  kernel: {
                    type: "array",
                    items: {
                      title: "A list of kernel command line arguments to match",
                      type: "string",
                    },
                  },
                  interface: {
                    type: "array",
                    items: {
                      title: "A list of interface names to match",
                      type: "string",
                    },
                  },
                  driver: {
                    type: "array",
                    items: {
                      title: "A list of driver names to match",
                      type: "string",
                    },
                  },
                  path: {
                    type: "array",
                    items: {
                      title:
                        "A list of paths to match against the ID_PATH udev property of devices",
                      type: "string",
                    },
                  },
                },
              },
              "ieee-8021x": {
                type: "object",
                title: "IEEE 802.1x (EAP) settings",
                properties: {
                  eap: {
                    type: "array",
                    items: {
                      title: "List of EAP methods used",
                      type: "string",
                      enum: ["leap", "md5", "tls", "peap", "ttls", "pwd", "fast"],
                    },
                  },
                  phase2Auth: {
                    title: "Phase 2 inner auth method",
                    type: "string",
                    enum: ["pap", "chap", "mschap", "mschapv2", "gtc", "otp", "md5", "tls"],
                  },
                  identity: {
                    title: "Identity string, often for example the user's login name",
                    type: "string",
                  },
                  password: {
                    title: "Password string used for EAP authentication",
                    type: "string",
                  },
                  caCert: {
                    title: "Path to CA certificate",
                    type: "string",
                  },
                  caCertPassword: {
                    title: "Password string for CA certificate if it is encrypted",
                    type: "string",
                  },
                  clientCert: {
                    title: "Path to client certificate",
                    type: "string",
                  },
                  clientCertPassword: {
                    title: "Password string for client certificate if it is encrypted",
                    type: "string",
                  },
                  privateKey: {
                    title: "Path to private key",
                    type: "string",
                  },
                  privateKeyPassword: {
                    title: "Password string for private key if it is encrypted",
                    type: "string",
                  },
                  anonymousIdentity: {
                    title: "Anonymous identity string for EAP authentication methods",
                    type: "string",
                  },
                  peapVersion: {
                    title:
                      "Which PEAP version is used when PEAP is set as the EAP method in the 'eap' property",
                    type: "string",
                    enum: ["0", "1"],
                  },
                  peapLabel: {
                    title: "Force the use of the new PEAP label during key derivation",
                    type: "boolean",
                  },
                },
              },
              vlan: {
                type: "object",
                title: "VLAN configuration",
                additionalProperties: false,
                required: ["id", "parent"],
                properties: {
                  id: {
                    title: "VLAN Identifier",
                    type: "integer",
                    minimum: 0,
                    maximum: 4095,
                  },
                  parent: {
                    title: "Parent interface",
                    type: "string",
                  },
                  protocol: {
                    title: "VLAN protocol for encapsulation",
                    type: "string",
                    default: "802.1Q",
                    enum: ["802.1Q", "802.1ad"],
                  },
                },
              },
            },
          },
        },
      },
    },
    user: {
      title: "First user settings",
      type: "object",
      additionalProperties: false,
      properties: {
        fullName: {
          title: "Full name",
          type: "string",
          examples: ["Jane Doe"],
        },
        userName: {
          title: "User login name",
          type: "string",
          examples: ["jane.doe"],
        },
        password: {
          title: 'User password (plain text or hashed depending on the "hashedPassword" field)',
          type: "string",
          examples: ["nots3cr3t"],
        },
        hashedPassword: {
          title: "Flag for hashed password (true) or plain text password (false or not defined)",
          type: "boolean",
        },
        sshPublicKey: {
          title: "One or more SSH keys",
          anyOf: [
            {
              type: "string",
              title: "Single SSH Key",
            },
            {
              type: "array",
              items: {
                type: "string",
              },
              title: "List of SSH Keys",
              minItems: 1,
            },
          ],
        },
        sshPublicKeys: {
          title: "One or more SSH keys",
          anyOf: [
            {
              type: "string",
              title: "Single SSH Key",
            },
            {
              type: "array",
              items: {
                type: "string",
              },
              title: "List of SSH Keys",
              minItems: 1,
            },
          ],
        },
      },
      required: ["fullName", "userName", "password"],
    },
    root: {
      title: "Root authentication settings",
      type: "object",
      additionalProperties: false,
      properties: {
        password: {
          title: 'Root password (plain text or hashed depending on the "hashedPassword" field)',
          type: "string",
        },
        hashedPassword: {
          title: "Flag for hashed password (true) or plain text password (false or not defined)",
          type: "boolean",
        },
        sshPublicKey: {
          title: "One or more SSH keys",
          anyOf: [
            {
              type: "string",
              title: "Single SSH Key",
            },
            {
              type: "array",
              items: {
                type: "string",
              },
              title: "List of SSH Keys",
              minItems: 1,
            },
          ],
        },
        sshPublicKeys: {
          title: "One or more SSH keys",
          anyOf: [
            {
              type: "string",
              title: "Single SSH Key",
            },
            {
              type: "array",
              items: {
                type: "string",
              },
              title: "List of SSH Keys",
              minItems: 1,
            },
          ],
        },
      },
    },
    l10n: {
      title: "Localization settings",
      type: "object",
      additionalProperties: false,
      properties: {
        locale: {
          title: "Locale ID",
          type: "string",
          examples: ["en_US.UTF-8", "en_US"],
        },
        keymap: {
          title: "Keymap ID",
          type: "string",
          examples: ["us", "en", "es"],
        },
        timezone: {
          title: "Time zone ID",
          type: "string",
          examples: ["Europe/Berlin"],
        },
      },
    },
    localization: {
      deprecated: true,
      title: "Localization settings (old schema)",
      type: "object",
      additionalProperties: false,
      properties: {
        language: {
          title: "System language ID",
          type: "string",
          examples: ["en_US.UTF-8", "en_US"],
        },
        keyboard: {
          title: "Keyboard layout ID",
          type: "string",
        },
        timezone: {
          title: "Time zone identifier such as 'Europe/Berlin'",
          type: "string",
          examples: ["Europe/Berlin"],
        },
      },
    },
    storage: {
      $ref: "#/$defs/storage",
    },
    legacyAutoyastStorage: {
      title: "Legacy AutoYaST storage settings",
      description: "Accepts all options of the AutoYaST partitioning section (i.e., XML to JSON)",
      type: "array",
      items: {
        type: "object",
      },
    },
    iscsi: {
      $ref: "#/$defs/iscsi",
    },
  },
  $defs: {
    preScript: {
      title: "User-defined installation script that runs before the installation starts",
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          description: "Script name, to be used as file name",
          type: "string",
        },
        body: {
          title: "Script content",
          description:
            "Script content, starting with the shebang. DEPRECATED: replaced by 'content'",
          type: "string",
          deprecated: true,
        },
        content: {
          title: "Script content",
          description: "Script content, starting with the shebang.",
          type: "string",
        },
        url: {
          title: "Script URL reference",
          description: "Absolute or relative URL to fetch the script from",
        },
      },
      required: ["name"],
      oneOf: [
        {
          required: ["body"],
        },
        {
          required: ["url"],
        },
        {
          required: ["content"],
        },
      ],
    },
    postPartitioning: {
      title: "User-defined installation script that runs after the partitioning finishes",
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          description: "Script name, to be used as file name",
          type: "string",
        },
        body: {
          title: "Script content",
          description:
            "Script content, starting with the shebang. DEPRECATED: replaced by 'content'",
          type: "string",
          deprecated: true,
        },
        content: {
          title: "Script content",
          description: "Script content, starting with the shebang.",
          type: "string",
        },
        url: {
          title: "Script URL reference",
          description: "Absolute or relative URL to fetch the script from.",
        },
      },
      required: ["name"],
      oneOf: [
        {
          required: ["body"],
        },
        {
          required: ["url"],
        },
        {
          required: ["content"],
        },
      ],
    },
    postScript: {
      title: "User-defined installation script that runs after the installation finishes",
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          description: "Script name, to be used as file name",
          type: "string",
        },
        body: {
          title: "Script content",
          description:
            "Script content, starting with the shebang. DEPRECATED: replaced by 'content'",
          type: "string",
          deprecated: true,
        },
        content: {
          title: "Script content",
          description: "Script content, starting with the shebang.",
          type: "string",
        },
        url: {
          title: "Script URL reference",
          description: "Absolute or relative URL to fetch the script from.",
        },
        chroot: {
          title: "Whether it should run in the installed system using a chroot environment",
          description: "whether to chroot to the target system (default: yes) or not",
          type: "boolean",
        },
      },
      required: ["name"],
      oneOf: [
        {
          required: ["body"],
        },
        {
          required: ["url"],
        },
        {
          required: ["content"],
        },
      ],
    },
    initScript: {
      title:
        "User-defined installation script that runs during the first boot of the target system, once the installation is finished",
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          description: "Script name, to be used as file name",
          type: "string",
        },
        body: {
          title: "Script content",
          description:
            "Script content, starting with the shebang. DEPRECATED: replaced by 'content'",
          type: "string",
          deprecated: true,
        },
        content: {
          title: "Script content",
          description: "Script content, starting with the shebang.",
          type: "string",
        },
        url: {
          title: "Script URL reference",
          description: "Absolute or relative URL to fetch the script from.",
        },
      },
      required: ["name"],
      oneOf: [
        {
          required: ["body"],
        },
        {
          required: ["url"],
        },
        {
          required: ["content"],
        },
      ],
    },
    file: {
      title: "User-defined file to deploy",
      type: "object",
      additionalProperties: false,
      properties: {
        destination: {
          description: "path where file should be deployed",
          type: "string",
        },
        content: {
          title: "File content",
          description: "File content",
          type: "string",
        },
        url: {
          title: "File URL reference",
          description: "Absolute or relative URL to fetch the file from.",
        },
        permissions: {
          title: "File permissions",
          description: "file permissions on installed system",
          type: "string",
        },
        user: {
          title: "File owner user",
          description: "User owning the file on installed system. User has to already exist",
          type: "string",
        },
        group: {
          title: "File owner group",
          description: "Group owning the file on installed system. User has to already exist",
          type: "string",
        },
      },
      required: ["destination"],
      oneOf: [
        {
          required: ["url"],
        },
        {
          required: ["content"],
        },
      ],
    },
    answer: {
      title: "Automatic answer to questions",
      type: "object",
      additionalProperties: false,
      properties: {
        class: {
          title: "Question class",
          description: 'Each question has a "class" which works as an identifier.',
          type: "string",
          examples: ["storage.activate_multipath"],
        },
        text: {
          title: "Question text",
          description: "Question full text",
          type: "string",
        },
        password: {
          title: "Password provided as response to a password-based question",
          type: "string",
        },
        data: {
          title: "Additional data for matching questions",
          description: "Additional data for matching questions and answers",
          type: "object",
          examples: [
            {
              device: "/dev/sda",
            },
          ],
        },
        action: {
          title: "Predefined question action",
          description: "Action to use for the question.",
          type: "string",
        },
        answer: {
          description: 'Action to use for the question. Prefer using "action" instead.',
          type: "string",
          deprecated: true,
        },
        value: {
          title: "Predefined question value",
          description: "Value to use for the question (depending on the type of the question).",
          type: "string",
        },
      },
    },
    storage: {
      title: "Config",
      description: "Storage config.",
      type: "object",
      additionalProperties: false,
      properties: {
        boot: {
          $ref: "#/$defs/storage/$defs/boot",
        },
        drives: {
          description: "Drives (disks, BIOS RAIDs and multipath devices).",
          type: "array",
          items: {
            $ref: "#/$defs/storage/$defs/driveElement",
          },
        },
        volumeGroups: {
          description: "LVM volume groups.",
          type: "array",
          items: {
            $ref: "#/$defs/storage/$defs/volumeGroup",
          },
        },
        mdRaids: {
          description: "MD RAIDs.",
          type: "array",
          items: {
            $ref: "#/$defs/storage/$defs/mdRaidElement",
          },
        },
      },
      $defs: {
        boot: {
          description: "Allows configuring boot partitions automatically.",
          type: "object",
          additionalProperties: false,
          required: ["configure"],
          properties: {
            configure: {
              description: "Whether to configure partitions for booting.",
              type: "boolean",
            },
            device: {
              $ref: "#/$defs/storage/$defs/alias",
            },
          },
        },
        driveElement: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/nonPartitionedDrive",
            },
            {
              $ref: "#/$defs/storage/$defs/partitionedDrive",
            },
          ],
        },
        nonPartitionedDrive: {
          description: "Drive without a partition table (e.g., directly formatted).",
          type: "object",
          additionalProperties: false,
          properties: {
            search: {
              $ref: "#/$defs/storage/$defs/driveSearch",
            },
            alias: {
              $ref: "#/$defs/storage/$defs/alias",
            },
            encryption: {
              $ref: "#/$defs/storage/$defs/encryption",
            },
            filesystem: {
              $ref: "#/$defs/storage/$defs/filesystem",
            },
          },
        },
        partitionedDrive: {
          type: "object",
          additionalProperties: false,
          required: ["partitions"],
          properties: {
            search: {
              $ref: "#/$defs/storage/$defs/driveSearch",
            },
            alias: {
              $ref: "#/$defs/storage/$defs/alias",
            },
            ptableType: {
              $ref: "#/$defs/storage/$defs/ptableType",
            },
            partitions: {
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/partitionElement",
              },
            },
          },
        },
        mdRaidElement: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/nonPartitionedMdRaid",
            },
            {
              $ref: "#/$defs/storage/$defs/partitionedMdRaid",
            },
          ],
        },
        nonPartitionedMdRaid: {
          description: "MD RAID without a partition table (e.g., directly formatted).",
          type: "object",
          additionalProperties: false,
          properties: {
            search: {
              $ref: "#/$defs/storage/$defs/mdRaidSearch",
            },
            alias: {
              $ref: "#/$defs/storage/$defs/alias",
            },
            name: {
              $ref: "#/$defs/storage/$defs/baseName",
            },
            level: {
              $ref: "#/$defs/storage/$defs/mdRaidLevel",
            },
            parity: {
              $ref: "#/$defs/storage/$defs/mdRaidParity",
            },
            chunkSize: {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
            devices: {
              $ref: "#/$defs/storage/$defs/mdRaidDevices",
            },
            encryption: {
              $ref: "#/$defs/storage/$defs/encryption",
            },
            filesystem: {
              $ref: "#/$defs/storage/$defs/filesystem",
            },
          },
        },
        partitionedMdRaid: {
          type: "object",
          additionalProperties: false,
          required: ["partitions"],
          properties: {
            search: {
              $ref: "#/$defs/storage/$defs/mdRaidSearch",
            },
            alias: {
              $ref: "#/$defs/storage/$defs/alias",
            },
            name: {
              $ref: "#/$defs/storage/$defs/baseName",
            },
            level: {
              $ref: "#/$defs/storage/$defs/mdRaidLevel",
            },
            parity: {
              $ref: "#/$defs/storage/$defs/mdRaidParity",
            },
            chunkSize: {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
            devices: {
              $ref: "#/$defs/storage/$defs/mdRaidDevices",
            },
            ptableType: {
              $ref: "#/$defs/storage/$defs/ptableType",
            },
            partitions: {
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/partitionElement",
              },
            },
          },
        },
        mdRaidLevel: {
          title: "MD level",
          enum: ["raid0", "raid1", "raid5", "raid6", "raid10"],
        },
        mdRaidParity: {
          title: "MD parity",
          description: "Only applies to raid5, raid6 and raid10",
          enum: [
            "left_asymmetric",
            "left_symmetric",
            "right_asymmetric",
            "right_symmetric",
            "first",
            "last",
            "near_2",
            "offset_2",
            "far_2",
            "near_3",
            "offset_3",
            "far_3",
          ],
        },
        mdRaidDevices: {
          description: "Devices used by the MD RAID.",
          type: "array",
          items: {
            $ref: "#/$defs/storage/$defs/alias",
          },
        },
        ptableType: {
          description: "Partition table type.",
          $comment:
            "The partition table is created only if all the current partitions are deleted.",
          enum: ["gpt", "msdos", "dasd"],
        },
        partitionElement: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/simpleVolumesGenerator",
            },
            {
              $ref: "#/$defs/storage/$defs/advancedPartitionsGenerator",
            },
            {
              $ref: "#/$defs/storage/$defs/regularPartition",
            },
            {
              $ref: "#/$defs/storage/$defs/partitionToDelete",
            },
            {
              $ref: "#/$defs/storage/$defs/partitionToDeleteIfNeeded",
            },
          ],
        },
        simpleVolumesGenerator: {
          description:
            "Automatically creates the default or mandatory volumes configured by the selected product.",
          type: "object",
          additionalProperties: false,
          required: ["generate"],
          properties: {
            generate: {
              enum: ["default", "mandatory"],
            },
          },
        },
        advancedPartitionsGenerator: {
          description:
            "Creates the default or mandatory partitions configured by the selected product.",
          type: "object",
          additionalProperties: false,
          required: ["generate"],
          properties: {
            generate: {
              type: "object",
              additionalProperties: false,
              required: ["partitions"],
              properties: {
                partitions: {
                  enum: ["default", "mandatory"],
                },
                encryption: {
                  $ref: "#/$defs/storage/$defs/encryption",
                },
              },
            },
          },
        },
        regularPartition: {
          type: "object",
          additionalProperties: false,
          properties: {
            search: {
              $ref: "#/$defs/storage/$defs/partitionSearch",
            },
            alias: {
              $ref: "#/$defs/storage/$defs/alias",
            },
            id: {
              title: "Partition id",
              enum: ["linux", "swap", "lvm", "raid", "esp", "prep", "bios_boot"],
            },
            size: {
              $ref: "#/$defs/storage/$defs/size",
            },
            encryption: {
              $ref: "#/$defs/storage/$defs/encryption",
            },
            filesystem: {
              $ref: "#/$defs/storage/$defs/filesystem",
            },
          },
        },
        partitionToDelete: {
          type: "object",
          additionalProperties: false,
          required: ["delete", "search"],
          properties: {
            search: {
              $ref: "#/$defs/storage/$defs/deletePartitionSearch",
            },
            delete: {
              description: "Delete the partition.",
              const: true,
            },
          },
        },
        partitionToDeleteIfNeeded: {
          type: "object",
          additionalProperties: false,
          required: ["deleteIfNeeded", "search"],
          properties: {
            search: {
              $ref: "#/$defs/storage/$defs/deletePartitionSearch",
            },
            deleteIfNeeded: {
              description: "Delete the partition if needed to make space.",
              const: true,
            },
            size: {
              $ref: "#/$defs/storage/$defs/size",
            },
          },
        },
        volumeGroup: {
          description: "LVM volume group.",
          type: "object",
          additionalProperties: false,
          required: ["name"],
          properties: {
            name: {
              $ref: "#/$defs/storage/$defs/baseName",
            },
            search: {
              $ref: "#/$defs/storage/$defs/volumeGroupSearch",
            },
            extentSize: {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
            physicalVolumes: {
              description: "Devices to use as physical volumes.",
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/physicalVolumeElement",
              },
            },
            logicalVolumes: {
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/logicalVolumeElement",
              },
            },
          },
        },
        physicalVolumeElement: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/alias",
            },
            {
              $ref: "#/$defs/storage/$defs/simplePhysicalVolumesGenerator",
            },
            {
              $ref: "#/$defs/storage/$defs/advancedPhysicalVolumesGenerator",
            },
          ],
        },
        simplePhysicalVolumesGenerator: {
          description:
            "Automatically creates the needed physical volumes in the indicated devices.",
          type: "object",
          additionalProperties: false,
          required: ["generate"],
          properties: {
            generate: {
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/alias",
              },
            },
          },
        },
        advancedPhysicalVolumesGenerator: {
          description:
            "Automatically creates the needed physical volumes in the indicated devices.",
          type: "object",
          additionalProperties: false,
          required: ["generate"],
          properties: {
            generate: {
              type: "object",
              additionalProperties: false,
              required: ["targetDevices"],
              properties: {
                targetDevices: {
                  type: "array",
                  items: {
                    $ref: "#/$defs/storage/$defs/alias",
                  },
                },
                encryption: {
                  $ref: "#/$defs/storage/$defs/encryption",
                },
              },
            },
          },
        },
        logicalVolumeElement: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/simpleVolumesGenerator",
            },
            {
              $ref: "#/$defs/storage/$defs/advancedLogicalVolumesGenerator",
            },
            {
              $ref: "#/$defs/storage/$defs/logicalVolume",
            },
            {
              $ref: "#/$defs/storage/$defs/thinPoolLogicalVolume",
            },
            {
              $ref: "#/$defs/storage/$defs/thinLogicalVolume",
            },
            {
              $ref: "#/$defs/storage/$defs/logicalVolumeToDelete",
            },
            {
              $ref: "#/$defs/storage/$defs/logicalVolumeToDeleteIfNeeded",
            },
          ],
        },
        advancedLogicalVolumesGenerator: {
          description:
            "Automatically creates the default or mandatory logical volumes configured by the selected product.",
          type: "object",
          additionalProperties: false,
          required: ["generate"],
          properties: {
            generate: {
              type: "object",
              additionalProperties: false,
              required: ["logicalVolumes"],
              properties: {
                logicalVolumes: {
                  enum: ["default", "mandatory"],
                },
                encryption: {
                  $ref: "#/$defs/storage/$defs/encryption",
                },
                stripes: {
                  $ref: "#/$defs/storage/$defs/logicalVolumeStripes",
                },
                stripeSize: {
                  $ref: "#/$defs/storage/$defs/sizeValue",
                },
              },
            },
          },
        },
        logicalVolume: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              $ref: "#/$defs/storage/$defs/baseName",
            },
            search: {
              $ref: "#/$defs/storage/$defs/logicalVolumeSearch",
            },
            size: {
              $ref: "#/$defs/storage/$defs/size",
            },
            stripes: {
              $ref: "#/$defs/storage/$defs/logicalVolumeStripes",
            },
            stripeSize: {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
            encryption: {
              $ref: "#/$defs/storage/$defs/encryption",
            },
            filesystem: {
              $ref: "#/$defs/storage/$defs/filesystem",
            },
          },
        },
        thinPoolLogicalVolume: {
          type: "object",
          additionalProperties: false,
          required: ["pool"],
          properties: {
            pool: {
              description: "LVM thin pool.",
              const: true,
            },
            alias: {
              $ref: "#/$defs/storage/$defs/alias",
            },
            name: {
              $ref: "#/$defs/storage/$defs/baseName",
            },
            size: {
              $ref: "#/$defs/storage/$defs/size",
            },
            stripes: {
              $ref: "#/$defs/storage/$defs/logicalVolumeStripes",
            },
            stripeSize: {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
            encryption: {
              $ref: "#/$defs/storage/$defs/encryption",
            },
          },
        },
        thinLogicalVolume: {
          type: "object",
          additionalProperties: false,
          required: ["usedPool"],
          properties: {
            name: {
              $ref: "#/$defs/storage/$defs/baseName",
            },
            size: {
              $ref: "#/$defs/storage/$defs/size",
            },
            usedPool: {
              $ref: "#/$defs/storage/$defs/alias",
            },
            encryption: {
              $ref: "#/$defs/storage/$defs/encryption",
            },
            filesystem: {
              $ref: "#/$defs/storage/$defs/filesystem",
            },
          },
        },
        logicalVolumeToDelete: {
          type: "object",
          additionalProperties: false,
          required: ["delete", "search"],
          properties: {
            search: {
              $ref: "#/$defs/storage/$defs/deleteLogicalVolumeSearch",
            },
            delete: {
              description: "Delete the logical volume.",
              const: true,
            },
          },
        },
        logicalVolumeToDeleteIfNeeded: {
          type: "object",
          additionalProperties: false,
          required: ["deleteIfNeeded", "search"],
          properties: {
            search: {
              $ref: "#/$defs/storage/$defs/deleteLogicalVolumeSearch",
            },
            deleteIfNeeded: {
              description: "Delete the logical volume if needed to make space.",
              const: true,
            },
            size: {
              $ref: "#/$defs/storage/$defs/size",
            },
          },
        },
        logicalVolumeStripes: {
          description: "Number of stripes.",
          type: "integer",
          minimum: 1,
          maximum: 128,
        },
        searchSortCriterionOrder: {
          description: "Direction of sorting at the search results",
          enum: ["asc", "desc"],
        },
        driveSearch: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchAll",
            },
            {
              $ref: "#/$defs/storage/$defs/searchName",
            },
            {
              $ref: "#/$defs/storage/$defs/driveAdvancedSearch",
            },
          ],
        },
        driveAdvancedSearch: {
          type: "object",
          additionalProperties: false,
          properties: {
            condition: {
              $ref: "#/$defs/storage/$defs/driveSearchCondition",
            },
            sort: {
              $ref: "#/$defs/storage/$defs/driveSearchSort",
            },
            max: {
              $ref: "#/$defs/storage/$defs/searchMax",
            },
            ifNotFound: {
              $ref: "#/$defs/storage/$defs/searchActions",
            },
          },
        },
        driveSearchCondition: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchConditionName",
            },
            {
              $ref: "#/$defs/storage/$defs/searchConditionSize",
            },
          ],
        },
        driveSearchSort: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/driveSearchSortCriterion",
            },
            {
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/driveSearchSortCriterion",
              },
            },
          ],
        },
        driveSearchSortCriterion: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/driveSearchSortCriterionShort",
            },
            {
              $ref: "#/$defs/storage/$defs/driveSearchSortCriterionFull",
            },
          ],
        },
        driveSearchSortCriterionShort: {
          enum: ["name", "size"],
        },
        driveSearchSortCriterionFull: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
            size: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
          },
          minProperties: 1,
          maxProperties: 1,
        },
        mdRaidSearch: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchAll",
            },
            {
              $ref: "#/$defs/storage/$defs/searchName",
            },
            {
              $ref: "#/$defs/storage/$defs/mdRaidAdvancedSearch",
            },
          ],
        },
        mdRaidAdvancedSearch: {
          type: "object",
          additionalProperties: false,
          properties: {
            condition: {
              $ref: "#/$defs/storage/$defs/mdRaidSearchCondition",
            },
            sort: {
              $ref: "#/$defs/storage/$defs/mdRaidSearchSort",
            },
            max: {
              $ref: "#/$defs/storage/$defs/searchMax",
            },
            ifNotFound: {
              $ref: "#/$defs/storage/$defs/searchCreatableActions",
            },
          },
        },
        mdRaidSearchCondition: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchConditionName",
            },
            {
              $ref: "#/$defs/storage/$defs/searchConditionSize",
            },
          ],
        },
        mdRaidSearchSort: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/mdRaidSearchSortCriterion",
            },
            {
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/mdRaidSearchSortCriterion",
              },
            },
          ],
        },
        mdRaidSearchSortCriterion: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/mdRaidSearchSortCriterionShort",
            },
            {
              $ref: "#/$defs/storage/$defs/mdRaidSearchSortCriterionFull",
            },
          ],
        },
        mdRaidSearchSortCriterionShort: {
          enum: ["name", "size"],
        },
        mdRaidSearchSortCriterionFull: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
            size: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
          },
          minProperties: 1,
          maxProperties: 1,
        },
        volumeGroupSearch: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchAll",
            },
            {
              $ref: "#/$defs/storage/$defs/searchName",
            },
            {
              $ref: "#/$defs/storage/$defs/volumeGroupAdvancedSearch",
            },
          ],
        },
        volumeGroupAdvancedSearch: {
          type: "object",
          additionalProperties: false,
          properties: {
            condition: {
              $ref: "#/$defs/storage/$defs/volumeGroupSearchCondition",
            },
            sort: {
              $ref: "#/$defs/storage/$defs/volumeGroupSearchSort",
            },
            max: {
              $ref: "#/$defs/storage/$defs/searchMax",
            },
            ifNotFound: {
              $ref: "#/$defs/storage/$defs/searchCreatableActions",
            },
          },
        },
        volumeGroupSearchCondition: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchConditionName",
            },
            {
              $ref: "#/$defs/storage/$defs/searchConditionSize",
            },
          ],
        },
        volumeGroupSearchSort: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/volumeGroupSearchSortCriterion",
            },
            {
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/volumeGroupSearchSortCriterion",
              },
            },
          ],
        },
        volumeGroupSearchSortCriterion: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/volumeGroupSearchSortCriterionShort",
            },
            {
              $ref: "#/$defs/storage/$defs/volumeGroupSearchSortCriterionFull",
            },
          ],
        },
        volumeGroupSearchSortCriterionShort: {
          enum: ["name", "size"],
        },
        volumeGroupSearchSortCriterionFull: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
            size: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
          },
          minProperties: 1,
          maxProperties: 1,
        },
        partitionSearch: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchAll",
            },
            {
              $ref: "#/$defs/storage/$defs/searchName",
            },
            {
              $ref: "#/$defs/storage/$defs/partitionAdvancedSearch",
            },
          ],
        },
        partitionAdvancedSearch: {
          type: "object",
          additionalProperties: false,
          properties: {
            condition: {
              $ref: "#/$defs/storage/$defs/partitionSearchCondition",
            },
            sort: {
              $ref: "#/$defs/storage/$defs/partitionSearchSort",
            },
            max: {
              $ref: "#/$defs/storage/$defs/searchMax",
            },
            ifNotFound: {
              $ref: "#/$defs/storage/$defs/searchCreatableActions",
            },
          },
        },
        deletePartitionSearch: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchAll",
            },
            {
              $ref: "#/$defs/storage/$defs/searchName",
            },
            {
              $ref: "#/$defs/storage/$defs/deletePartitionAdvancedSearch",
            },
          ],
        },
        deletePartitionAdvancedSearch: {
          type: "object",
          additionalProperties: false,
          properties: {
            condition: {
              $ref: "#/$defs/storage/$defs/partitionSearchCondition",
            },
            sort: {
              $ref: "#/$defs/storage/$defs/partitionSearchSort",
            },
            max: {
              $ref: "#/$defs/storage/$defs/searchMax",
            },
            ifNotFound: {
              $ref: "#/$defs/storage/$defs/searchActions",
            },
          },
        },
        partitionSearchCondition: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchConditionName",
            },
            {
              $ref: "#/$defs/storage/$defs/searchConditionSize",
            },
            {
              $ref: "#/$defs/storage/$defs/searchConditionPartitionNumber",
            },
          ],
        },
        logicalVolumeSearch: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchAll",
            },
            {
              $ref: "#/$defs/storage/$defs/searchName",
            },
            {
              $ref: "#/$defs/storage/$defs/logicalVolumeAdvancedSearch",
            },
          ],
        },
        logicalVolumeAdvancedSearch: {
          type: "object",
          additionalProperties: false,
          properties: {
            condition: {
              $ref: "#/$defs/storage/$defs/logicalVolumeSearchCondition",
            },
            sort: {
              $ref: "#/$defs/storage/$defs/logicalVolumeSearchSort",
            },
            max: {
              $ref: "#/$defs/storage/$defs/searchMax",
            },
            ifNotFound: {
              $ref: "#/$defs/storage/$defs/searchCreatableActions",
            },
          },
        },
        deleteLogicalVolumeSearch: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchAll",
            },
            {
              $ref: "#/$defs/storage/$defs/searchName",
            },
            {
              $ref: "#/$defs/storage/$defs/deleteLogicalVolumeAdvancedSearch",
            },
          ],
        },
        deleteLogicalVolumeAdvancedSearch: {
          type: "object",
          additionalProperties: false,
          properties: {
            condition: {
              $ref: "#/$defs/storage/$defs/logicalVolumeSearchCondition",
            },
            sort: {
              $ref: "#/$defs/storage/$defs/logicalVolumeSearchSort",
            },
            max: {
              $ref: "#/$defs/storage/$defs/searchMax",
            },
            ifNotFound: {
              $ref: "#/$defs/storage/$defs/searchActions",
            },
          },
        },
        logicalVolumeSearchCondition: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/searchConditionName",
            },
            {
              $ref: "#/$defs/storage/$defs/searchConditionSize",
            },
          ],
        },
        searchConditionName: {
          type: "object",
          additionalProperties: false,
          required: ["name"],
          properties: {
            name: {
              $ref: "#/$defs/storage/$defs/searchName",
            },
          },
        },
        searchConditionSize: {
          type: "object",
          additionalProperties: false,
          required: ["size"],
          properties: {
            size: {
              anyOf: [
                {
                  $ref: "#/$defs/storage/$defs/sizeValue",
                },
                {
                  $ref: "#/$defs/storage/$defs/searchConditionSizeEqual",
                },
                {
                  $ref: "#/$defs/storage/$defs/searchConditionSizeGreater",
                },
                {
                  $ref: "#/$defs/storage/$defs/searchConditionSizeLess",
                },
              ],
            },
          },
        },
        searchConditionSizeEqual: {
          type: "object",
          additionalProperties: false,
          required: ["equal"],
          properties: {
            equal: {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
          },
        },
        searchConditionSizeGreater: {
          type: "object",
          additionalProperties: false,
          required: ["greater"],
          properties: {
            greater: {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
          },
        },
        searchConditionSizeLess: {
          type: "object",
          additionalProperties: false,
          required: ["less"],
          properties: {
            less: {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
          },
        },
        searchConditionPartitionNumber: {
          type: "object",
          additionalProperties: false,
          required: ["number"],
          properties: {
            number: {
              description: "Partition number (e.g., 1 for vda1).",
              type: "integer",
              minimum: 1,
            },
          },
        },
        partitionSearchSort: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/partitionSearchSortCriterion",
            },
            {
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/partitionSearchSortCriterion",
              },
            },
          ],
        },
        partitionSearchSortCriterion: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/partitionSearchSortCriterionShort",
            },
            {
              $ref: "#/$defs/storage/$defs/partitionSearchSortCriterionFull",
            },
          ],
        },
        partitionSearchSortCriterionShort: {
          enum: ["name", "size", "number"],
        },
        partitionSearchSortCriterionFull: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
            size: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
            number: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
          },
          minProperties: 1,
          maxProperties: 1,
        },
        logicalVolumeSearchSort: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/logicalVolumeSearchSortCriterion",
            },
            {
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/logicalVolumeSearchSortCriterion",
              },
            },
          ],
        },
        logicalVolumeSearchSortCriterion: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/logicalVolumeSearchSortCriterionShort",
            },
            {
              $ref: "#/$defs/storage/$defs/logicalVolumeSearchSortCriterionFull",
            },
          ],
        },
        logicalVolumeSearchSortCriterionShort: {
          enum: ["name", "size", "number"],
        },
        logicalVolumeSearchSortCriterionFull: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
            size: {
              $ref: "#/$defs/storage/$defs/searchSortCriterionOrder",
            },
          },
          minProperties: 1,
          maxProperties: 1,
        },
        searchMax: {
          description: "Maximum devices to match.",
          type: "integer",
          minimum: 1,
        },
        searchActions: {
          description: "How to handle the section if the device is not found.",
          enum: ["skip", "error"],
          default: "error",
        },
        searchCreatableActions: {
          description: "How to handle the section if the device is not found.",
          enum: ["skip", "error", "create"],
          default: "error",
        },
        searchAll: {
          description:
            "Shortcut to match all devices if there is any (equivalent to specify no conditions and to skip the entry if no device is found).",
          const: "*",
        },
        searchName: {
          description: "Search by device name",
          type: "string",
          examples: ["/dev/vda", "/dev/disk/by-id/ata-WDC_WD3200AAKS-75L9"],
        },
        alias: {
          description: "Alias used to reference a device.",
          type: "string",
        },
        baseName: {
          description: "Device base name.",
          type: "string",
          pattern: "^[^/]+$",
          examples: ["system"],
        },
        size: {
          title: "Size",
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
            {
              title: "Size tuple",
              description: "Lower size limit and optionally upper size limit.",
              type: "array",
              items: {
                $ref: "#/$defs/storage/$defs/sizeValueWithCurrent",
              },
              minItems: 1,
              maxItems: 2,
              examples: [[1024, "current"], ["1 GiB", "5 GiB"], [1024, "2 GiB"], ["2 GiB"]],
            },
            {
              title: "Size range",
              description: "Size range.",
              type: "object",
              additionalProperties: false,
              required: ["min"],
              properties: {
                min: {
                  $ref: "#/$defs/storage/$defs/sizeValueWithCurrent",
                },
                max: {
                  $ref: "#/$defs/storage/$defs/sizeValueWithCurrent",
                },
              },
            },
          ],
        },
        sizeValue: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/sizeString",
            },
            {
              $ref: "#/$defs/storage/$defs/sizeBytes",
            },
          ],
        },
        sizeValueWithCurrent: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/sizeValue",
            },
            {
              title: "Size current",
              description: "The current size of the device.",
              const: "current",
            },
          ],
        },
        sizeString: {
          description: "Human readable size.",
          type: "string",
          pattern: "^[0-9]+(\\.[0-9]+)?(\\s*([KkMmGgTtPpEeZzYy][iI]?)?[Bb])?$",
          examples: ["2 GiB", "1.5 TB", "1TIB", "1073741824 b", "1073741824"],
        },
        sizeBytes: {
          description: "Size in bytes.",
          type: "integer",
          minimum: 0,
          examples: [1024, 2048],
        },
        encryption: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/encryptionLuks1",
            },
            {
              $ref: "#/$defs/storage/$defs/encryptionLuks2",
            },
            {
              $ref: "#/$defs/storage/$defs/encryptionPervasiveLuks2",
            },
            {
              $ref: "#/$defs/storage/$defs/encryptionTPM",
            },
            {
              $ref: "#/$defs/storage/$defs/encryptionSwap",
            },
          ],
        },
        encryptionLuks1: {
          description: "LUKS1 encryption.",
          type: "object",
          additionalProperties: false,
          required: ["luks1"],
          properties: {
            luks1: {
              type: "object",
              additionalProperties: false,
              required: ["password"],
              properties: {
                password: {
                  $ref: "#/$defs/storage/$defs/encryptionPassword",
                },
                cipher: {
                  $ref: "#/$defs/storage/$defs/encryptionCipher",
                },
                keySize: {
                  $ref: "#/$defs/storage/$defs/encryptionKeySize",
                },
              },
            },
          },
        },
        encryptionLuks2: {
          description: "LUKS2 encryption.",
          type: "object",
          additionalProperties: false,
          required: ["luks2"],
          properties: {
            luks2: {
              type: "object",
              additionalProperties: false,
              required: ["password"],
              properties: {
                password: {
                  $ref: "#/$defs/storage/$defs/encryptionPassword",
                },
                cipher: {
                  $ref: "#/$defs/storage/$defs/encryptionCipher",
                },
                keySize: {
                  $ref: "#/$defs/storage/$defs/encryptionKeySize",
                },
                pbkdFunction: {
                  $ref: "#/$defs/storage/$defs/encryptionPbkdFunction",
                },
                label: {
                  description: "LUKS2 label.",
                  type: "string",
                },
              },
            },
          },
        },
        encryptionPervasiveLuks2: {
          description: "LUKS2 pervasive encryption.",
          type: "object",
          additionalProperties: false,
          required: ["pervasiveLuks2"],
          properties: {
            pervasiveLuks2: {
              type: "object",
              additionalProperties: false,
              required: ["password"],
              properties: {
                password: {
                  $ref: "#/$defs/storage/$defs/encryptionPassword",
                },
                apqns: {
                  description: "List of APQNs used to generate secure keys.",
                  type: "array",
                  items: {
                    examples: ["01.0001", "01.0002"],
                    type: "string",
                  },
                },
                keyType: {
                  description: "Type of the generated secure key.",
                  enum: ["EP11-AES", "CCA-AESCIPHER", "CCA-AESDATA"],
                },
              },
            },
          },
        },
        encryptionTPM: {
          description: "TPM-Based Full Disk Encryption.",
          type: "object",
          additionalProperties: false,
          required: ["tpmFde"],
          properties: {
            tpmFde: {
              type: "object",
              additionalProperties: false,
              required: ["password"],
              properties: {
                password: {
                  $ref: "#/$defs/storage/$defs/encryptionPassword",
                },
              },
            },
          },
        },
        encryptionSwap: {
          description: "Swap encryptions.",
          enum: ["protected_swap", "secure_swap", "random_swap"],
        },
        encryptionPassword: {
          description: "Password to use when creating a new encryption device.",
          type: "string",
        },
        encryptionCipher: {
          description:
            "The value must be compatible with the --cipher argument of the command cryptsetup.",
          type: "string",
        },
        encryptionKeySize: {
          description:
            "The value (in bits) has to be a multiple of 8. The possible key sizes are limited by the used cipher.",
          type: "integer",
        },
        encryptionPbkdFunction: {
          enum: ["pbkdf2", "argon2i", "argon2id"],
        },
        filesystem: {
          type: "object",
          additionalProperties: false,
          properties: {
            reuseIfPossible: {
              description:
                "Try to reuse the existing file system. In some cases the file system could not be reused, for example, if the device is re-encrypted.",
              type: "boolean",
              default: false,
            },
            type: {
              $ref: "#/$defs/storage/$defs/filesystemType",
            },
            label: {
              description: "File system label.",
              type: "string",
            },
            path: {
              description: "Mount path.",
              type: "string",
              examples: ["/var/log"],
            },
            mountBy: {
              title: "Mount by",
              description: "How to mount the device.",
              enum: ["device", "id", "label", "path", "uuid"],
            },
            mkfsOptions: {
              description: "Options for creating the file system.",
              type: "array",
              items: {
                type: "string",
              },
            },
            mountOptions: {
              description: "Options to add to the fourth field of fstab.",
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
        filesystemType: {
          anyOf: [
            {
              $ref: "#/$defs/storage/$defs/filesystemTypeAny",
            },
            {
              $ref: "#/$defs/storage/$defs/filesystemTypeBtrfs",
            },
          ],
        },
        filesystemTypeAny: {
          enum: [
            "bcachefs",
            "btrfs",
            "exfat",
            "ext2",
            "ext3",
            "ext4",
            "f2fs",
            "jfs",
            "nfs",
            "nilfs2",
            "ntfs",
            "reiserfs",
            "swap",
            "tmpfs",
            "vfat",
            "xfs",
          ],
        },
        filesystemTypeBtrfs: {
          description: "Btrfs file system.",
          type: "object",
          additionalProperties: false,
          required: ["btrfs"],
          properties: {
            btrfs: {
              type: "object",
              additionalProperties: false,
              properties: {
                snapshots: {
                  description: "Whether to configrue Btrfs snapshots.",
                  type: "boolean",
                },
              },
            },
          },
        },
      },
    },
    iscsi: {
      title: "Config",
      description: "iSCSI config.",
      type: "object",
      additionalProperties: false,
      properties: {
        initiator: {
          description: "Initiator name.",
          type: "string",
        },
        targets: {
          description: "List of targets.",
          type: "array",
          items: {
            $ref: "#/$defs/iscsi/$defs/target",
          },
        },
      },
      $defs: {
        target: {
          type: "object",
          additionalProperties: false,
          required: ["address", "port", "name", "interface"],
          properties: {
            address: {
              description: "IP address.",
              type: "string",
            },
            port: {
              type: "integer",
              minimum: 0,
            },
            name: {
              type: "string",
            },
            interface: {
              type: "string",
            },
            startup: {
              enum: ["onboot", "manual", "automatic"],
            },
            authByTarget: {
              $ref: "#/$defs/iscsi/$defs/authentication",
            },
            authByInitiator: {
              $ref: "#/$defs/iscsi/$defs/authentication",
            },
          },
        },
        authentication: {
          type: "object",
          additionalProperties: false,
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
            },
            password: {
              type: "string",
            },
          },
        },
      },
    },
    dasd: {
      title: "Config",
      description: "DASD config.",
      type: "object",
      additionalProperties: false,
      properties: {
        devices: {
          description: "List of DASD devices.",
          type: "array",
          items: {
            $ref: "#/$defs/dasd/$defs/device",
          },
        },
      },
      $defs: {
        device: {
          type: "object",
          additionalProperties: false,
          required: ["channel"],
          properties: {
            channel: {
              description: "DASD device channel.",
              type: "string",
            },
            state: {
              description: "Specify target state of device. Either activate it or deactivate it.",
              enum: ["active", "offline"],
              default: "active",
            },
            format: {
              description:
                "If device should be formatted. If not specified then it format device only if not already formatted.",
              type: "boolean",
            },
            diag: {
              description:
                "If device have set diag flag. If not specified then it keep what device has before.",
              type: "boolean",
            },
          },
        },
      },
    },
    zfcp: {
      title: "Config",
      description: "zFCP config.",
      type: "object",
      additionalProperties: false,
      properties: {
        controllers: {
          description: "List of zFCP controllers.",
          type: "array",
          items: {
            type: "string",
            description: "zFCP controller channel id.",
          },
        },
        devices: {
          description: "List of zFCP devices.",
          type: "array",
          items: {
            $ref: "#/$defs/zfcp/$defs/device",
          },
        },
      },
      $defs: {
        device: {
          type: "object",
          additionalProperties: false,
          required: ["channel", "wwpn", "lun"],
          properties: {
            channel: {
              description: "zFCP controller channel id.",
              type: "string",
              examples: ["0.0.fa00"],
            },
            wwpn: {
              description: "WWPN of the target port.",
              type: "string",
              examples: ["0x500507630300c562"],
            },
            lun: {
              description: "LUN of the SCSI device.",
              type: "string",
              examples: ["0x4010403300000000"],
            },
            active: {
              description: "Whether to activate the device.",
              type: "boolean",
              default: true,
            },
          },
        },
      },
    },
    software: {
      title: "Config",
      description: "Software configuration.",
      type: "object",
      properties: {
        patterns: {
          anyOf: [
            {
              $ref: "#/$defs/software/$defs/patternsArray",
            },
            {
              $ref: "#/$defs/software/$defs/patternsObject",
            },
          ],
        },
        packages: {
          description: "List of packages to install",
          type: "array",
          items: {
            type: "string",
            examples: ["vim"],
          },
        },
        onlyRequired: {
          description: "Flag if only minimal hard dependencies should be used in solver",
          type: "boolean",
        },
        extraRepositories: {
          description:
            "List of user specified repositories that will be used on top of default ones",
          type: "array",
          items: {
            $ref: "#/$defs/software/$defs/repository",
          },
        },
      },
      $defs: {
        patternsArray: {
          description: "List of user-selected patterns to install",
          type: "array",
          items: {
            type: "string",
            examples: ["minimal_base"],
          },
        },
        patternsObject: {
          description: "Modifications for the list of user-selected patterns to install",
          type: "object",
          additionalProperties: false,
          properties: {
            add: {
              description: "List of user-selected patterns to add to the list",
              type: "array",
              items: {
                type: "string",
              },
            },
            remove: {
              description: "List of user-selected patterns to remove from the list",
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
        repository: {
          description: "Packages repository",
          type: "object",
          additionalProperties: false,
          properties: {
            alias: {
              description: "alias used for repository. Acting as identifier",
              type: "string",
            },
            url: {
              description: "URL pointing to repository",
              type: "string",
            },
            priority: {
              description: "Repository priority",
              type: "integer",
            },
            name: {
              description: "User visible name. Defaults to alias",
              type: "string",
            },
            productDir: {
              description: "product directory on multi repo DVD. Usually not needed",
              type: "string",
            },
            enabled: {
              description:
                "If repository should be enabled. Defaults to true. Useful when adding additional repo that should not be immediately use.",
              type: "boolean",
            },
            allowUnsigned: {
              description:
                "If unsigned repositories are allowed. Mainly useful for repositories that is hand crafted without GPG signature.",
              type: "boolean",
            },
            gpgFingerprints: {
              description:
                "List of GPG fingerprints that is accepted for this repository. Useful for own repositories with proper GPG signature.",
              type: "array",
              items: {
                type: "string",
                pattern: "^[0-9a-fA-F ]+",
              },
            },
          },
        },
      },
    },
  },
};
