import { useState } from "react";
import { useSpend } from "@/context/SpendContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuditSettings } from "@/lib/types";
import { Slider } from "@/components/ui/slider";

export const SettingsPanel = () => {
  const { settings, updateSettings } = useSpend();
  const [local, setLocal] = useState<AuditSettings>(settings);

  const handleSave = () => {
    updateSettings(local);
  };

  return (
    <div className="glass-card rounded-lg p-6 max-w-lg animate-slide-in">
      <h3 className="text-lg font-semibold mb-6">Audit Thresholds</h3>
      <div className="space-y-5">
        {/* ── AI Confidence Threshold (NEW) ── */}
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">AI Auto-Approval Threshold</Label>
          <p className="text-xs text-muted-foreground/70">
            Transactions with AI confidence below this % are sent to the Triage Queue for manual review.
          </p>
          <div className="flex items-center gap-4">
            <Slider
              value={[Math.round(local.triageThreshold * 100)]}
              onValueChange={(values) =>
                setLocal({ ...local, triageThreshold: values[0] / 100 })
              }
              min={50}
              max={99}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-mono font-semibold min-w-[3ch] text-right">
              {Math.round(local.triageThreshold * 100)}%
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground/50 px-1">
            <span>Lenient (50%)</span>
            <span>Strict (99%)</span>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Variance Threshold (%)</Label>
          <p className="text-xs text-muted-foreground/70">Flag transactions exceeding this % above vendor average</p>
          <Input
            type="number"
            value={local.varianceThreshold}
            onChange={(e) => setLocal({ ...local, varianceThreshold: Number(e.target.value) })}
            className="bg-secondary border-border font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Duplicate Window (days)</Label>
          <p className="text-xs text-muted-foreground/70">Same vendor + amount within this window = duplicate</p>
          <Input
            type="number"
            value={local.duplicateWindowDays}
            onChange={(e) => setLocal({ ...local, duplicateWindowDays: Number(e.target.value) })}
            className="bg-secondary border-border font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Unnecessary Categories</Label>
          <p className="text-xs text-muted-foreground/70">Comma-separated list of categories to auto-flag</p>
          <Input
            value={local.unnecessaryCategories.join(", ")}
            onChange={(e) => setLocal({ ...local, unnecessaryCategories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            className="bg-secondary border-border"
          />
        </div>
        <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Save & Re-Audit
        </Button>
      </div>
    </div>
  );
};
