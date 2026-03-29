import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpend } from "@/context/SpendContext";
import { VendorRule, LedgerCategory, Transaction, LedgerType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash, RefreshCw, Plus, Edit2, ListOrdered, Briefcase, User, Landmark } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const RulesAndCategories = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Rules & Categories</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Manage your ledger, create vendor rules, and bulk assign transactions.
        </p>
      </div>

      <Tabs defaultValue="vendor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ledger" className="text-xs md:text-sm px-1 md:px-3">Ledger</TabsTrigger>
          <TabsTrigger value="vendor" className="text-xs md:text-sm px-1 md:px-3">Vendor Rules</TabsTrigger>
          <TabsTrigger value="triage" className="text-xs md:text-sm px-1 md:px-3">Triage</TabsTrigger>
        </TabsList>
        <TabsContent value="ledger" className="mt-6 rounded-lg p-6 glass-card text-card-foreground">
          <LedgerMasterTree />
        </TabsContent>
        <TabsContent value="vendor" className="mt-6 rounded-lg p-6 glass-card text-card-foreground">
          <VendorRuleEngine />
        </TabsContent>
        <TabsContent value="triage" className="mt-6 rounded-lg p-6 glass-card text-card-foreground">
          <TriageQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// -----------------------------------------------------------------------------
// TAB A: Ledger Master Tree
// -----------------------------------------------------------------------------
function LedgerMasterTree() {
  const { ledgerCategories, setLedgerCategories } = useSpend();

  const getIconForLedger = (type: string) => {
    switch (type) {
      case 'Business': return <Briefcase className="h-4 w-4" />;
      case 'Personal': return <User className="h-4 w-4" />;
      case 'Balance Sheet': return <Landmark className="h-4 w-4" />;
      default: return <ListOrdered className="h-4 w-4" />;
    }
  };

  const handleAddCategory = (ledgerType: LedgerType) => {
    const name = window.prompt(`Enter new category name for ${ledgerType}:`);
    if (!name?.trim()) return;
    const newCat: LedgerCategory = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      ledgerType: ledgerType as LedgerType,
      subCategories: []
    };
    setLedgerCategories([...ledgerCategories, newCat]);
    toast({ title: "Category Added", description: `${name} has been added.` });
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${catName}"? All its sub-categories will be lost.`)) return;
    setLedgerCategories(ledgerCategories.filter(c => c.id !== catId));
    toast({ title: "Category Deleted" });
  };

  const handleAddSubCategory = (catId: string, catName: string) => {
    const name = window.prompt(`Enter new sub-category name for ${catName}:`);
    if (!name?.trim()) return;
    const desc = window.prompt("Enter examples or description (optional):") || "";
    
    const next = ledgerCategories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          subCategories: [...c.subCategories, {
            id: Math.random().toString(36).substring(2, 9),
            name: name.trim(),
            descriptionOrExamples: desc.trim()
          }]
        };
      }
      return c;
    });
    setLedgerCategories(next);
    toast({ title: "Sub-category Added", description: `${name} has been created.` });
  };

  const handleDeleteSubCategory = (catId: string, subId: string, subName: string) => {
    if (!window.confirm(`Are you sure you want to delete the sub-category "${subName}"?`)) return;
    
    const next = ledgerCategories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          subCategories: c.subCategories.filter(s => s.id !== subId)
        };
      }
      return c;
    });
    setLedgerCategories(next);
    toast({ title: "Sub-category Deleted" });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Ledger Configuration</h2>
      <p className="text-sm text-muted-foreground mb-6">Create and modify your dual-ledger (Business/Personal) plus Balance Sheet items.</p>
      
      <Accordion type="multiple" defaultValue={['Business', 'Personal', 'Balance Sheet']} className="space-y-4">
        {['Business', 'Personal', 'Balance Sheet'].map(ledgerType => (
          <AccordionItem key={ledgerType} value={ledgerType} className="rounded-lg glass-card px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 font-semibold text-base">
                {getIconForLedger(ledgerType)}
                {ledgerType} Ledger
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="space-y-6 pl-6 border-l-2 ml-2">
                {ledgerCategories.filter(c => c.ledgerType === ledgerType).map(category => (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm bg-muted/50 px-2 py-1 rounded inline-block">
                        {category.name}
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                          const newName = window.prompt("Edit category name:", category.name);
                          if (!newName?.trim() || newName === category.name) return;
                          setLedgerCategories(ledgerCategories.map(c => c.id === category.id ? { ...c, name: newName.trim() } : c));
                        }}><Edit2 className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteCategory(category.id, category.name)}><Trash className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pl-4">
                      {category.subCategories.map(sub => (
                        <div key={sub.id} className="flex justify-between items-start border-b border-border/50 pb-2 last:border-0 hover:bg-muted/20 p-2 rounded transition-colors group">
                          <div>
                            <p className="text-sm font-medium">{sub.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{sub.descriptionOrExamples || "No description provided."}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                              const newName = window.prompt("Edit sub-category name:", sub.name);
                              if (!newName?.trim() || newName === sub.name) return;
                              const newDesc = window.prompt("Edit description:", sub.descriptionOrExamples);
                              setLedgerCategories(ledgerCategories.map(c => c.id === category.id ? {
                                ...c,
                                subCategories: c.subCategories.map(s => s.id === sub.id ? { ...s, name: newName.trim(), descriptionOrExamples: newDesc?.trim() || "" } : s)
                              } : c));
                            }}><Edit2 className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteSubCategory(category.id, sub.id, sub.name)}><Trash className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => handleAddSubCategory(category.id, category.name)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Sub-category
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2 border-dashed" onClick={() => handleAddCategory(ledgerType as "Business" | "Balance Sheet" | "Anomaly")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Category to {ledgerType}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// -----------------------------------------------------------------------------
// TAB B: Vendor Rule Engine
// -----------------------------------------------------------------------------
function VendorRuleEngine() {
  const { vendorRules, setVendorRules, applyRulesToTransactions, ledgerCategories, transactions } = useSpend();
  
  const [matchString, setMatchString] = useState("");
  const [matchType, setMatchType] = useState<"EXACT" | "CONTAINS">("CONTAINS");
  const [targetSubCategoryId, setTargetSubCategoryId] = useState("");
  const [selectedLedgerType, setSelectedLedgerType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const uniqueVendors = useMemo(() => Array.from(new Set(transactions.map(t => t.vendor))).sort(), [transactions]);
  const activeLedgerTypes = useMemo(() => Array.from(new Set(ledgerCategories.map(c => c.ledgerType))), [ledgerCategories]);

  // Cascading: categories filtered by selected ledger type
  const filteredCategories = useMemo(() => {
    if (!selectedLedgerType) return [];
    return ledgerCategories.filter(c => c.ledgerType === selectedLedgerType);
  }, [ledgerCategories, selectedLedgerType]);

  // Cascading: sub-categories filtered by selected category
  const filteredSubCategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    const cat = ledgerCategories.find(c => c.id === selectedCategoryId);
    return cat ? cat.subCategories : [];
  }, [ledgerCategories, selectedCategoryId]);

  const handleLedgerChange = (val: string) => {
    setSelectedLedgerType(val);
    setSelectedCategoryId("");
    setTargetSubCategoryId("");
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategoryId(val);
    setTargetSubCategoryId("");
  };

  const handleAddRule = () => {
    if (!matchString.trim() || !targetSubCategoryId) {
      toast({ title: "Validation Error", description: "Please provide a match string and target sub-category.", variant: "destructive" });
      return;
    }
    
    const newRule: VendorRule = {
      id: Math.random().toString(36).substring(2, 9),
      matchString: matchString.trim(),
      matchType,
      targetSubCategoryId,
    };
    
    setVendorRules([...vendorRules, newRule]);
    setMatchString("");
    setSelectedLedgerType("");
    setSelectedCategoryId("");
    setTargetSubCategoryId("");
    toast({ title: "Rule added", description: "Vendor automation rule created successfully." });
  };

  const handleDeleteRule = (id: string) => {
    setVendorRules(vendorRules.filter(r => r.id !== id));
    toast({ title: "Rule deleted", description: "The vendor rule has been removed." });
  };

  const handleRetroactiveSync = () => {
    applyRulesToTransactions();
    toast({ title: "Sync Complete", description: "Rules applied to all past unmapped transactions." });
  };

  const getSubCategoryName = (subId: string) => {
    for (const cat of ledgerCategories) {
      const sub = cat.subCategories.find(s => s.id === subId);
      if (sub) return `${cat.name} > ${sub.name}`;
    }
    return "Unknown Category";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Vendor Automation Rules</h2>
          <p className="text-sm text-muted-foreground">Automatically route specific vendors to correct sub-categories.</p>
        </div>
        <Button onClick={handleRetroactiveSync} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Apply Rules to Past Transactions
        </Button>
      </div>

      <div className="glass-card p-4 rounded-lg space-y-4">
        {/* Row 1: Match String + Match Type */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1 relative">
            <label className="text-sm font-medium">Match String</label>
            <Input 
              placeholder="e.g. AMZN, ZOMATO" 
              value={matchString} 
              onChange={e => setMatchString(e.target.value)} 
              list="vendor-autocomplete"
            />
            <datalist id="vendor-autocomplete">
              {uniqueVendors.map(vendor => (
                <option key={vendor} value={vendor} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Match Type</label>
            <Select value={matchType} onValueChange={(val: "EXACT" | "CONTAINS") => setMatchType(val)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONTAINS">Contains</SelectItem>
                <SelectItem value="EXACT">Exact Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Cascading Ledger → Category → Sub-Category */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">1. Ledger Type</label>
            <Select value={selectedLedgerType} onValueChange={handleLedgerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select ledger..." />
              </SelectTrigger>
              <SelectContent>
                {activeLedgerTypes.map((lt) => (
                  <SelectItem key={lt} value={lt}>{lt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">2. Category</label>
            <Select value={selectedCategoryId} onValueChange={handleCategoryChange} disabled={!selectedLedgerType}>
              <SelectTrigger>
                <SelectValue placeholder={selectedLedgerType ? "Select category..." : "Pick a ledger first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">3. Sub-Category</label>
            <Select value={targetSubCategoryId} onValueChange={setTargetSubCategoryId} disabled={!selectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder={selectedCategoryId ? "Select sub-category..." : "Pick a category first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSubCategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddRule} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match String</TableHead>
              <TableHead>Match Type</TableHead>
              <TableHead>Target Category</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendorRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No vendor rules created yet.
                </TableCell>
              </TableRow>
            ) : (
              vendorRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.matchString}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">
                      {rule.matchType}
                    </span>
                  </TableCell>
                  <TableCell>{getSubCategoryName(rule.targetSubCategoryId)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)} className="h-8 w-8 text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// TAB C: Triage & Bulk Edit Queue
// -----------------------------------------------------------------------------
function TriageQueue() {
  const { transactions, updateTransactions, ledgerCategories, vendorRules, setVendorRules, currency } = useSpend();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetSubId, setTargetSubId] = useState("");
  const [createRule, setCreateRule] = useState(false);
  const [triageLedger, setTriageLedger] = useState("");
  const [triageCategory, setTriageCategory] = useState("");

  const uncategorizedArgs = useMemo(() => 
    transactions.filter(t => !t.subCategoryId), 
  [transactions]);

  const activeLedgerTypes = useMemo(() => Array.from(new Set(ledgerCategories.map(c => c.ledgerType))), [ledgerCategories]);

  const triageFilteredCategories = useMemo(() => {
    if (!triageLedger) return [];
    return ledgerCategories.filter(c => c.ledgerType === triageLedger);
  }, [ledgerCategories, triageLedger]);

  const triageFilteredSubCategories = useMemo(() => {
    if (!triageCategory) return [];
    const cat = ledgerCategories.find(c => c.id === triageCategory);
    return cat ? cat.subCategories : [];
  }, [ledgerCategories, triageCategory]);

  const handleTriageLedgerChange = (val: string) => {
    setTriageLedger(val);
    setTriageCategory("");
    setTargetSubId("");
  };

  const handleTriageCategoryChange = (val: string) => {
    setTriageCategory(val);
    setTargetSubId("");
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === uncategorizedArgs.length) setSelectedIds([]);
    else setSelectedIds(uncategorizedArgs.map(t => t.id));
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkAssign = () => {
    if (!targetSubId || selectedIds.length === 0) return;

    const nextTxns = transactions.map(t => {
      if (selectedIds.includes(t.id)) {
        return { ...t, subCategoryId: targetSubId, isVendorMapped: false };
      }
      return t;
    });

    updateTransactions(nextTxns);
    
    // Auto rule generation
    if (createRule) {
      const baseTxn = uncategorizedArgs.find(t => t.id === selectedIds[0]);
      if (baseTxn) {
        const newRule: VendorRule = {
          id: Math.random().toString(36).substring(2, 9),
          matchString: baseTxn.vendor.split(' ')[0],
          matchType: 'CONTAINS',
          targetSubCategoryId: targetSubId,
        };
        setVendorRules([...vendorRules, newRule]);
        toast({ title: "Assigned & Rule Created", description: `Assigned ${selectedIds.length} items and created vendor rule for '${newRule.matchString}'.` });
      }
    } else {
      toast({ title: "Bulk Assign Complete", description: `Assigned ${selectedIds.length} transactions.` });
    }
    
    setSelectedIds([]);
    setTargetSubId("");
    setTriageLedger("");
    setTriageCategory("");
    setCreateRule(false);
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-lg font-semibold">Triage Uncategorized Transactions</h2>
        <p className="text-sm text-muted-foreground">Fast-action queue to bulk assign transactions missing a ledger sub-category.</p>
      </div>

      <div className="glass-card rounded-lg max-h-[500px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length > 0 && selectedIds.length === uncategorizedArgs.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vendor Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Auto Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uncategorizedArgs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Badge variant="outline" className="text-green-500 bg-green-500/10 mb-2">Queue Empty</Badge>
                    <p>All items have been categorized!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              uncategorizedArgs.map((txn) => (
                <TableRow key={txn.id} className={selectedIds.includes(txn.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(txn.id)}
                      onCheckedChange={() => toggleSelect(txn.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{txn.date}</TableCell>
                  <TableCell className="font-medium">{txn.vendor}</TableCell>
                  <TableCell>{currency}{txn.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {txn.category}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky bottom-4 left-0 right-0 max-w-3xl mx-auto glass-card-elevated shadow-xl rounded-lg p-4 animate-in slide-in-from-bottom-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                <Badge>{selectedIds.length}</Badge> items selected
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <Checkbox id="create-rule" checked={createRule} onCheckedChange={(c) => setCreateRule(!!c)} />
                <label htmlFor="create-rule" className="text-xs font-medium leading-none cursor-pointer">
                  Auto-rule future
                </label>
              </div>
            </div>
            
            <div className="flex flex-1 items-end gap-3 w-full">
              <div className="space-y-1 flex-1">
                <label className="text-xs text-muted-foreground">Ledger</label>
                <Select value={triageLedger} onValueChange={handleTriageLedgerChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Ledger..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLedgerTypes.map((lt) => (
                      <SelectItem key={lt} value={lt}>{lt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-xs text-muted-foreground">Category</label>
                <Select value={triageCategory} onValueChange={handleTriageCategoryChange} disabled={!triageLedger}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={triageLedger ? "Category..." : "—"} />
                  </SelectTrigger>
                  <SelectContent>
                    {triageFilteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-xs text-muted-foreground">Sub-Category</label>
                <Select value={targetSubId} onValueChange={setTargetSubId} disabled={!triageCategory}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={triageCategory ? "Sub-category..." : "—"} />
                  </SelectTrigger>
                  <SelectContent>
                    {triageFilteredSubCategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleBulkAssign} disabled={!targetSubId} size="sm" className="shrink-0">
                Apply Action
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RulesAndCategories;
