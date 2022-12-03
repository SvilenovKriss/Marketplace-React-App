
export interface Networks {
  [key: number]: string;
}
export const walletConnectSupportedNetworks: Networks = {
  // Add your network rpc URL here
  1: "https://ethereumnode.defiterm.io",
  3: "https://ethereumnode.defiterm-dev.net"
};

// Network chain ids
export const supportedMetamaskNetworks = [1, 3, 4, 5, 42];

export const ALBT_TOKEN_ADDRESS = "0xc6869a93ef55e1d8ec8fdcda89c9d93616cf0a72";
export const MARKETPLACE_ADDRESS = "0x5C2B7a7Fc884f0cDE7dff648144898b0CE919D39";