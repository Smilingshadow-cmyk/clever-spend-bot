import { SettingsPanel } from "@/components/SettingsPanel";

const SettingsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-muted-foreground">Configure audit thresholds</p>
    </div>
    <SettingsPanel />
  </div>
);

export default SettingsPage;
