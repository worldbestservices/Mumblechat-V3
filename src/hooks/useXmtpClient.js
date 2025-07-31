import { useState, useEffect } from 'react';
import { Client } from '@xmtp/browser-sdk';
import { useAppKitAccount } from '@reown/appkit/react';
import { getAddress } from 'viem';

export function useXmtpClient() {
  const { isConnected, address, signMessageAsync } = useAppKitAccount();

  const [xmtpClient, setXmtpClient] = useState(null);
  const [isLoadingXmtp, setIsLoadingXmtp] = useState(true);
  const [xmtpError, setXmtpError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const waitUntilSignerReady = async () => {
      let attempts = 0;
      while (
        isMounted &&
        (!address || typeof signMessageAsync !== 'function')
      ) {
        console.log(`⏳ Waiting for address/signer... (${attempts})`);
        await new Promise((r) => setTimeout(r, 300));
        attempts++;
        if (attempts > 40) break; // wait max ~12 seconds
      }

      const ready = isMounted && address && typeof signMessageAsync === 'function';
      console.log("✅ Signer ready:", ready);
      return ready;
    };

    const initXmtp = async () => {
      console.log("🔁 XMTP V3: Initializing. Connected:", isConnected);

      if (!isConnected) {
        setXmtpClient(null);
        setXmtpError("Wallet not connected");
        setIsLoadingXmtp(false);
        return;
      }

      const ready = await waitUntilSignerReady();
      if (!ready) {
        console.warn("⚠️ XMTP blocked: address or signer not ready after wait");
        setXmtpClient(null);
        setXmtpError("XMTP signer/address not ready.");
        setIsLoadingXmtp(false);
        return;
      }

      try {
        setIsLoadingXmtp(true);
        setXmtpError(null);

        const normalized = await getAddress(address);

        const customSigner = {
          getAddress: async () => normalized,
          signMessage: async (msg) => {
            console.log("✍️ Signing message for XMTP...");
            return await signMessageAsync({ message: msg });
          },
          getIdentifier: async () => `eip155:1370:${normalized}`
        };

        const client = await Client.create(customSigner, {
          env: 'production',
        });

        if (isMounted) {
          console.log("✅ XMTP client ready:", client.address);
          setXmtpClient(client);
        }
      } catch (err) {
        console.error("❌ XMTP Client init failed:", err);
        if (isMounted) {
          setXmtpError(err.message || "XMTP init error");
          setXmtpClient(null);
        }
      } finally {
        if (isMounted) setIsLoadingXmtp(false);
      }
    };

    initXmtp();

    return () => {
      isMounted = false;
    };
  }, [isConnected, address, signMessageAsync]);

  return { xmtpClient, isLoadingXmtp, xmtpError };
}
