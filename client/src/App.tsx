import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { WalletContextProvider } from "@/contexts/WalletProvider";
import Dashboard from "@/pages/Dashboard";
import Strategies from "@/pages/Strategies";
import Portfolio from "@/pages/Portfolio";
import RiskAnalysis from "@/pages/RiskAnalysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 mt-20 p-0 md:p-6 overflow-x-hidden">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/strategies" component={Strategies} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/risk" component={RiskAnalysis} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletContextProvider>
        <Toaster />
        <Router />
      </WalletContextProvider>
    </QueryClientProvider>
  );
}

export default App;
