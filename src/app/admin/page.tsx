"use client";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { ConnectButton } from "@/components/web3/connect-button";

export default function AdminPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">管理员后台</h1>
        <ConnectButton />
      </div>
      <AdminDashboard />
    </main>
  );
}

