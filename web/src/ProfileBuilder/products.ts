export interface Product {
  id: string;
  name: string;
}

export const SLES_PRODUCTS: Product[] = [
  { id: "SLES", name: "SUSE Linux Enterprise Server 16.1 Beta" },
  { id: "SLES_SAP", name: "SUSE Linux Enterprise Server for SAP applications 16.1 Beta" },
];

export const OPENSUSE_PRODUCTS: Product[] = [
  { id: "Tumbleweed", name: "openSUSE Tumbleweed" },
  { id: "openSUSE_Leap", name: "openSUSE Leap 16.1" },
  { id: "Slowroll", name: "openSUSE Slowroll" },
  { id: "MicroOS", name: "openSUSE MicroOS" },
  { id: "Kalpa", name: "openSUSE Kalpa Desktop" },
  { id: "openSUSE_Leap_Micro", name: "openSUSE Leap Micro 6.2" },
];
