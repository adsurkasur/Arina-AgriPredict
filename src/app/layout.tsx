import "../index.css";
import { ReactNode } from "react";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { MainLayout } from "@/components/layout/MainLayout";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>AgriPredict - Agricultural Demand Forecasting Platform</title>
        <meta name="description" content="Advanced agricultural demand forecasting and data analysis platform with AI-powered insights for better crop planning and market predictions." />
        <meta name="author" content="AgriPredict" />
        <meta property="og:title" content="AgriPredict - Agricultural Demand Forecasting" />
        <meta property="og:description" content="AI-powered agricultural demand forecasting platform for smarter farming decisions" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/public/placeholder.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@lovable_dev" />
        <meta name="twitter:image" content="/public/placeholder.svg" />
      </head>
      <body className="bg-background text-foreground min-h-screen">
        <ClientProviders>
          <MainLayout>
            {children}
          </MainLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
