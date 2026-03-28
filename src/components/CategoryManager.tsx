import { useState } from "react";
import { Category, loadCategories, saveCategories } from "@/utils/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, X, Check, Trash2 } from "lucide-react";

interface Props {
  categories: Category[];
  onUpdate: (cats: Category[]) => void;
}

export function CategoryManager({ categories, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; color: string; keywords: string }>({ label: "", color: "", keywords: "" });
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<{ id: string; label: string; color: string; icon: string; keywords: string }>({ id: "", label: "", color: "#6b7280", icon: "📌", keywords: "" });

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ label: cat.label, color: cat.color, keywords: cat.keywords.join(", ") });
  };

  const saveEdit = (catId: string) => {
    const updated = categories.map(c => c.id === catId ? {
      ...c,
      label: editForm.label,
      color: editForm.color,
      keywords: editForm.keywords.split(",").map(k => k.trim()).filter(Boolean),
    } : c);
    onUpdate(updated);
    saveCategories(updated);
    setEditingId(null);
  };

  const addCategory = () => {
    if (!newForm.label || !newForm.id) return;
    const cat: Category = {
      id: newForm.id.toLowerCase().replace(/\s+/g, "-"),
      label: newForm.label,
      color: newForm.color,
      icon: newForm.icon,
      keywords: newForm.keywords.split(",").map(k => k.trim()).filter(Boolean),
    };
    const updated = [...categories.filter(c => c.id !== "other"), cat, ...categories.filter(c => c.id === "other")];
    onUpdate(updated);
    saveCategories(updated);
    setAdding(false);
    setNewForm({ id: "", label: "", color: "#6b7280", icon: "📌", keywords: "" });
  };

  const deleteCategory = (catId: string) => {
    if (catId === "other") return;
    const updated = categories.filter(c => c.id !== catId);
    onUpdate(updated);
    saveCategories(updated);
  };

  return (
    <div className="glass-card rounded-lg animate-slide-in">
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
          <p className="text-xs text-muted-foreground/70 mt-1">Manage auto-categorization rules</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)} className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add Category
        </Button>
      </div>

      {adding && (
        <div className="p-4 border-b border-border/50 bg-muted/30 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Input placeholder="ID (e.g. gym)" value={newForm.id} onChange={e => setNewForm({ ...newForm, id: e.target.value })} className="text-sm" />
            <Input placeholder="Label" value={newForm.label} onChange={e => setNewForm({ ...newForm, label: e.target.value })} className="text-sm" />
            <Input placeholder="Icon emoji" value={newForm.icon} onChange={e => setNewForm({ ...newForm, icon: e.target.value })} className="text-sm" />
            <Input type="color" value={newForm.color} onChange={e => setNewForm({ ...newForm, color: e.target.value })} className="h-9 w-full" />
          </div>
          <Input placeholder="Keywords (comma separated)" value={newForm.keywords} onChange={e => setNewForm({ ...newForm, keywords: e.target.value })} className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" onClick={addCategory} className="gap-1 text-xs"><Check className="h-3 w-3" /> Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-xs">Cancel</Button>
          </div>
        </div>
      )}

      <div className="divide-y divide-border/30">
        {categories.map(cat => (
          <div key={cat.id} className="p-4">
            {editingId === cat.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Input value={editForm.label} onChange={e => setEditForm({ ...editForm, label: e.target.value })} className="text-sm" />
                  <Input type="color" value={editForm.color} onChange={e => setEditForm({ ...editForm, color: e.target.value })} className="h-9" />
                </div>
                <Input placeholder="Keywords (comma separated)" value={editForm.keywords} onChange={e => setEditForm({ ...editForm, keywords: e.target.value })} className="text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(cat.id)} className="gap-1 text-xs"><Check className="h-3 w-3" /> Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-xs">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                    {cat.icon} {cat.label}
                  </span>
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {cat.keywords.slice(0, 5).map(kw => (
                      <Badge key={kw} variant="outline" className="text-[10px] px-1.5 py-0">{kw}</Badge>
                    ))}
                    {cat.keywords.length > 5 && <span className="text-[10px] text-muted-foreground">+{cat.keywords.length - 5}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(cat)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  {cat.id !== "other" && (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCategory(cat.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
