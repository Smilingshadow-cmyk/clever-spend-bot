import { useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpend } from "@/context/SpendContext";
import { BANKS, BankId, fetchBankStatements, bankTransactionsToCSV } from "@/utils/fetchStatements";
import { parseCSV } from "@/lib/csv-parser";
import { toast } from "@/hooks/use-toast";

export function BankConnect() {
  const { importTransactions, transactions } = useSpend();
  const [selectedBank, setSelectedBank] = useState<BankId>("hdfc");
  const [isFetching, setIsFetching] = useState(false);

  const handleFetch = async () => {
    setIsFetching(true);
    try {
      const bankTxns = await fetchBankStatements(selectedBank);
      const csv = bankTransactionsToCSV(bankTxns);
      const parsed = parseCSV(csv);

      // Deduplicate by date+amount+vendor
      const existingKeys = new Set(transactions.map(t => `${t.date}|${t.amount}|${t.vendor}`));
      const newTxns = parsed.filter(t => !existingKeys.has(`${t.date}|${t.amount}|${t.vendor}`));

      if (newTxns.length === 0) {
        toast({ title: "No new transactions", description: "All fetched transactions already exist." });
      } else {
        importTransactions([...transactions, ...newTxns]);
        const bankName = BANKS.find(b => b.id === selectedBank)?.name || selectedBank;
        toast({ title: "Statements fetched", description: `${newTxns.length} transactions from ${bankName} (Demo)` });
      }
    } catch {
      toast({ title: "Fetch failed", description: "Could not fetch bank statements.", variant: "destructive" });
    }
    setIsFetching(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Connect Bank Account
          </CardTitle>
          <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">DEMO MODE</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedBank} onValueChange={(v) => setSelectedBank(v as BankId)}>
            <SelectTrigger className="sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BANKS.map(bank => (
                <SelectItem key={bank.id} value={bank.id}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: bank.color }} />
                    {bank.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleFetch} disabled={isFetching} className="gap-2">
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching…
              </>
            ) : (
              "Fetch Statements"
            )}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Simulated bank API — loads demo transaction data for testing
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Last synced: Today 9:14 AM ✓</p>
      </CardContent>
    </Card>
  );
}
