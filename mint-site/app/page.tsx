'use client';

import React, {CSSProperties, useState} from 'react';
import {  encodeFunctionData, Hash, defineChain, Chain } from 'viem';
import { eip712WalletActions, getGeneralPaymasterInput, chainConfig } from 'viem/zksync';
import contractABI from './abi/SampleNFT.json';
import {DynamicWidget, useDynamicContext} from "@dynamic-labs/sdk-react-core";


const NFT_CONTRACT_ADDRESS = "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA";
const PAYMASTER_ADDRESS = "0xa8dA6C5bf7dA8c2D5A642D3dcc0E04D68D134806";

// This chain config will be added to a future version of viem
// https://github.com/wevm/viem/pull/2581
const abstract: Chain = defineChain({
  ...chainConfig,
  id: 11124,
  name: 'Abstract Testnet',
  network: 'abstract-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.testnet.abs.xyz'],
    },
  },
  testnet: true,
});


export default function Home() {
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);

  const { primaryWallet } = useDynamicContext();

  const handleClick = async () => {
    if (isTransactionPending) return;

    try {
      setIsTransactionPending(true);
      setTransactionHash(null);
      const paymasterInput = getGeneralPaymasterInput({
        innerInput: '0x',
      });
      const publicClient = await primaryWallet?.connector.getPublicClient();
      const nonce = await publicClient.getTransactionCount({
        address: primaryWallet?.address
      });

      const walletClient = await primaryWallet?.connector.getWalletClient();

      const hash: Hash = await walletClient.extend(eip712WalletActions()).sendTransaction({
        account: primaryWallet?.address,
        to: NFT_CONTRACT_ADDRESS,
        chain: abstract,
        data: encodeFunctionData({
          abi: contractABI.abi,
          functionName: "mint",
          args: [primaryWallet?.address, 1]
        }),
        paymaster: PAYMASTER_ADDRESS,
        paymasterInput: paymasterInput,
        nonce: nonce
      });

      console.log("Transaction hash:", hash);
      setTransactionHash(hash);
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setIsTransactionPending(false);
    }
  };

return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Abstract Sponsored Transaction Demo</h1>
        {primaryWallet ? (
            <p style={styles.accountText}>Connected Account: {primaryWallet.address}</p>
        ) : (
            <p style={styles.accountText}>No account connected</p>
        )}
        {
          primaryWallet ? (
              <button
                  style={
                    isTransactionPending
                        ? {...styles.button, ...styles.disabledButton} as CSSProperties
                        : styles.button as CSSProperties
                  }
                  onClick={handleClick}
                  disabled={isTransactionPending || !primaryWallet}
              >
                {'Mint NFT'}
              </button>
          ) : (
              <div style={{ width: '50%' }}>
                <DynamicWidget />
              </div>
          )
        }

        {transactionHash && (
            <div style={styles.transactionInfo}>
              <p style={styles.transactionText}>Minted with no gas fees!</p>
              <a
                  href={`https://explorer.testnet.abs.xyz/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
              >
                View on Explorer
              </a>
            </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f0f0',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    color: '#333',
    marginBottom: '1.5rem',
    fontWeight: 'bold', // This makes the title bold
    fontSize: '24px', 
  },
  accountText: {
    color: '#666',
    marginBottom: '1rem',
    wordBreak: 'break-all' as const,
  },
  warningText: {
    color: 'red',
    marginBottom: '1rem',
  },
  transactionInfo: {
    color: 'blue',
    marginTop: '1rem',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  transactionText: {
    marginBottom: '0.5rem', // This adds space between the text and the link
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
    padding: '0.5rem 1rem', // This adds padding around the link text
    border: '1px solid #4CAF50',
    borderRadius: '4px',
    transition: 'background-color 0.3s, color 0.3s',
  },
  button: {
    backgroundColor: '#4CAF50',
    border: 'none',
    color: 'white',
    padding: '15px 32px',
    textAlign: 'center' as const,
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    margin: '4px 2px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  blueButton: {
    backgroundColor: '#007bff',
    border: 'none',
    color: 'white',
    padding: '15px 32px',
    textAlign: 'center' as const,
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    margin: '4px 2px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    color: '#666666',
    cursor: 'not-allowed',
  },
};