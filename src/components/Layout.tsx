import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { PageTransition } from "./PageTransition";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <PageTransition>
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </PageTransition>
    </div>
  );
};
