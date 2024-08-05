import type { Metadata } from "next";
import "./globals.css";
import {EthereumWalletConnectors} from "@dynamic-labs/ethereum";
import {DynamicContextProvider} from "@dynamic-labs/sdk-react-core";

export const metadata: Metadata = {
  title: "Abstract Sponsored Transaction",
  description: "NFT mint with Paymaster on Abstract",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DynamicContextProvider
            settings={{
              environmentId: 'ADD YOUR DYNAMIC.XYZ ENV HERE!',
              overrides: {
                evmNetworks: [{
                  blockExplorerUrls: ['https://explorer.testnet.abs.xyz'],
                  chainId: 11124,
                  chainName: 'Abstract Testnet',
                  name: 'Abstract',
                  nativeCurrency: {
                    decimals: 18,
                    name: 'Ether',
                    symbol: 'ETH',
                  },
                  networkId: 11124,
                  rpcUrls: ['https://api.testnet.abs.xyz']
                }]
              },
              walletConnectors: [EthereumWalletConnectors]
            }}
        >
        {children}
      </DynamicContextProvider>
      </body>
    </html>
  )
}
