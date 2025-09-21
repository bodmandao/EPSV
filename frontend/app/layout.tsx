"use client";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import config from "@/app/config/wagmi";
import { ModalProvider, useModal } from "./context/ModalContext";
import { ConfettiProvider } from "@/providers/ConfettiProvider";
import { SynapseProvider } from "@/providers/SynapseProvider";

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfettiProvider>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <SynapseProvider>
                  <PrivyProvider
                    config={{
                      loginMethods: ['email', 'google', 'twitter', 'discord'],
                      appearance: {
                        theme: 'dark',
                        accentColor: '#2a9d8f',
                      },
                    }}
                    appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}>
                    <ModalProvider>
                      {children}
                    </ModalProvider>
                  </PrivyProvider>
                </SynapseProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ConfettiProvider>
      </body>
    </html>
  );
}
