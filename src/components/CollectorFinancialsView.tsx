import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentStatistics from './financials/PaymentStatistics';
import CollectorsSummary from './financials/CollectorsSummary';
import AllPaymentsTable from './financials/AllPaymentsTable';
import CollectorsList from './CollectorsList';
import { Card } from "@/components/ui/card";
import { Wallet, Users, Receipt, PoundSterling } from "lucide-react";
import TotalCount from './TotalCount';

const CollectorFinancialsView = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: totals } = useQuery({
    queryKey: ['financial-totals'],
    queryFn: async () => {
      console.log('Fetching financial totals');
      
      // Use count option to get all records
      const { data: payments, error: paymentsError, count: paymentsCount } = await supabase
        .from('payment_requests')
        .select('amount, status, payment_type', { count: 'exact' });
      
      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        throw paymentsError;
      }

      // Use count option to get all records
      const { data: collectors, error: collectorsError, count: collectorsCount } = await supabase
        .from('members_collectors')
        .select('*', { count: 'exact' });

      if (collectorsError) {
        console.error('Error fetching collectors:', collectorsError);
        throw collectorsError;
      }

      // Use count option to get all records
      const { data: members, error: membersError, count: membersCount } = await supabase
        .from('members')
        .select('yearly_payment_amount, emergency_collection_amount, yearly_payment_status, emergency_collection_status', { count: 'exact' });

      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw membersError;
      }

      console.log('Total payments found:', paymentsCount);
      console.log('Total collectors found:', collectorsCount);
      console.log('Total members found:', membersCount);

      const totalAmount = payments?.reduce((sum, payment) => 
        payment.status === 'approved' ? sum + Number(payment.amount) : sum, 0
      ) || 0;

      const pendingAmount = payments?.reduce((sum, payment) => 
        payment.status === 'pending' ? sum + Number(payment.amount) : sum, 0
      ) || 0;

      const totalYearlyDue = members?.reduce((sum, member) => 
        sum + (member.yearly_payment_amount || 40), 0
      ) || 0;

      const totalEmergencyDue = members?.reduce((sum, member) => 
        sum + (member.emergency_collection_amount || 0), 0
      ) || 0;

      const totalCollectionDue = totalYearlyDue + totalEmergencyDue;
      const remainingCollection = totalCollectionDue - totalAmount;

      return {
        totalCollected: totalAmount,
        pendingAmount: pendingAmount,
        remainingAmount: remainingCollection,
        totalCollectors: collectors?.length || 0,
        totalTransactions: payments?.length || 0
      };
    }
  });

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <header className="mb-3 sm:mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium mb-1 sm:mb-2 text-white">
          Financial & Collector Management
        </h1>
        <p className="text-xs sm:text-sm text-white/80">
          Manage payments and collector assignments
        </p>
      </header>

      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="bg-emerald-500/10 border-emerald-500/20 p-2 sm:p-3 md:p-4 hover:bg-emerald-500/15 transition-colors">
            <TotalCount
              items={[{
                count: `£${totals.totalCollected.toLocaleString()}`,
                label: "Total Amount Collected",
                icon: <Wallet className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 text-emerald-400" />
              }]}
            />
          </Card>
          
          <Card className="bg-amber-500/10 border-amber-500/20 p-2 sm:p-3 md:p-4 hover:bg-amber-500/15 transition-colors">
            <TotalCount
              items={[{
                count: `£${totals.pendingAmount.toLocaleString()}`,
                label: "Pending Amount",
                icon: <Receipt className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 text-amber-400" />
              }]}
            />
          </Card>
          
          <Card className="bg-rose-500/10 border-rose-500/20 p-2 sm:p-3 md:p-4 hover:bg-rose-500/15 transition-colors">
            <TotalCount
              items={[{
                count: `£${totals.remainingAmount.toLocaleString()}`,
                label: "Remaining to Collect",
                icon: <PoundSterling className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 text-rose-400" />
              }]}
            />
          </Card>
          
          <Card className="bg-indigo-500/10 border-indigo-500/20 p-2 sm:p-3 md:p-4 hover:bg-indigo-500/15 transition-colors">
            <TotalCount
              items={[{
                count: totals.totalCollectors,
                label: "Active Collectors",
                icon: <Users className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 text-indigo-400" />
              }]}
            />
          </Card>
        </div>
      )}

      <Card className="bg-dashboard-card border-white/10">
        <Tabs defaultValue="overview" className="p-2 sm:p-3 md:p-4" onValueChange={setActiveTab}>
          <TabsList className="flex flex-col sm:flex-row w-full gap-1 sm:gap-2 bg-white/5 p-1">
            <TabsTrigger 
              className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2" 
              value="overview"
            >
              Payment Overview
            </TabsTrigger>
            <TabsTrigger 
              className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2" 
              value="collectors"
            >
              Collectors Overview
            </TabsTrigger>
            <TabsTrigger 
              className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2" 
              value="payments"
            >
              All Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-2 sm:mt-3 md:mt-4">
            <PaymentStatistics />
          </TabsContent>

          <TabsContent value="collectors" className="mt-2 sm:mt-3 md:mt-4">
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <CollectorsList />
              <CollectorsSummary />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-2 sm:mt-3 md:mt-4">
            <AllPaymentsTable showHistory={true} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CollectorFinancialsView;