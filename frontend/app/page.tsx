"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function HomePage() {
  const { login } = usePrivy();
  const { openConnectModal } = useConnectModal();
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1d3557] to-[#0b1d33] text-[#f1faee] font-inter flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold mb-4"
        >
          Encrypted Personal Storage Vault
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-[#a8dadc] mb-8 max-w-2xl"
        >
          Secure. Private. Decentralized. Take full control of your sensitive
          data with Filecoin Onchain Cloud.
        </motion.p>
        <div className="flex gap-4">
          <button
            onClick={openConnectModal}
            className="bg-[#2a9d8f] text-white hover:bg-[#21867b] rounded-2xl px-6 py-3 text-lg">
            Sign in with Wallet
          </button>
          <button
            onClick={() => login()}
            className="bg-[#e76f51] text-white hover:bg-[#cf4b46] rounded-2xl px-6 py-3 text-lg">
            Sign in with Social
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            icon: "🔒",
            title: "Private & Encrypted",
            desc: "Files secured with your keys. Only you control access.",
          },
          {
            icon: "☁️",
            title: "Decentralized Storage",
            desc: "Built on Filecoin Onchain Cloud for reliability.",
          },
          {
            icon: "⚡",
            title: "Fast & Accessible",
            desc: "Access anytime, share securely with anyone.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg text-center"
          >
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-[#a8dadc]">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Showcase Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your data, your control
          </h2>
          <p className="text-[#a8dadc] mb-6">
            Organize vaults, fund them with FIL, upload files, and share with
            complete privacy. EPSV puts you in charge.
          </p>
          <button className="bg-[#2a9d8f] hover:bg-[#21867b] text-white rounded-2xl px-6 py-3">
            Explore Dashboard
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative w-full h-80 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Replace with real screenshot later */}
          <Image
            src="/dashboard-preview.png"
            alt="Dashboard Preview"
            fill
            className="object-cover"
          />
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="py-20 flex justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-10 text-center max-w-2xl"
        >
          <h3 className="text-3xl font-bold mb-4">
            Ready to take control of your data?
          </h3>
          <div className="flex gap-4 justify-center">
            <button className="bg-[#2a9d8f] text-white rounded-2xl px-6 py-3">
              Sign in with Wallet
            </button>
            <button className="bg-[#e76f51] text-white rounded-2xl px-6 py-3">
              Sign in with Social
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-sm text-[#a8dadc]">
        <p>© {new Date().getFullYear()} EPSV. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-2">
          <a href="#" className="hover:text-white">
            Docs
          </a>
          <a href="#" className="hover:text-white">
            GitHub
          </a>
          <a href="#" className="hover:text-white">
            Twitter
          </a>
        </div>
      </footer>
    </main>
  );
}
