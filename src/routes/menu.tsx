import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { menuItems as initial, type MenuItem } from "@/lib/dashboard-data";

export const Route = createFileRoute("/menu")({
  head: () => ({ meta: [{ title: "Menu · Ember & Oak" }] }),
  component: MenuPage,
});

const empty: Omit<MenuItem, "id"> = { name: "", price: 0, category: "Mains", description: "" };

function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>(initial);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [preview, setPreview] = useState(false);

  const save = (item: MenuItem) => {
    setItems((items.find((i) => i.id === item.id) ? items.map((i) => (i.id === item.id ? item : i)) : [...items, item]));
    setEditing(null);
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <DashboardLayout
      title="Menu"
      subtitle="Manage your digital menu."
      actions={
        <>
          <button
            onClick={() => setPreview(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            onClick={() => setEditing({ ...empty, id: crypto.randomUUID() })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-glow"
          >
            <Plus className="h-4 w-4" /> Add item
          </button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-card border border-border p-5 shadow-soft hover:shadow-warm transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{item.category}</span>
                <h3 className="font-display text-lg mt-2 truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              </div>
              <span className="font-display text-xl text-primary shrink-0">${item.price.toFixed(2)}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(item)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary">
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button onClick={() => setItems(items.filter((i) => i.id !== item.id))} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border text-destructive px-3 py-1.5 text-xs hover:bg-destructive/10">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={items.find((i) => i.id === editing.id) ? "Edit item" : "New item"}>
          <ItemForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {preview && (
        <Modal onClose={() => setPreview(false)} title="Customer preview">
          <div className="rounded-xl bg-gradient-cream p-5">
            <p className="text-center font-display text-2xl">Ember & Oak</p>
            <p className="text-center text-xs text-muted-foreground mb-4">Digital Menu</p>
            {categories.map((cat) => (
              <div key={cat} className="mb-5">
                <h4 className="font-display text-sm uppercase tracking-widest text-primary mb-2">{cat}</h4>
                <ul className="space-y-2">
                  {items.filter((i) => i.category === cat).map((i) => (
                    <li key={i.id} className="flex justify-between gap-3 pb-2 border-b border-dashed border-border">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{i.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{i.description}</p>
                      </div>
                      <span className="text-sm font-display text-primary shrink-0">${i.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-2xl bg-card border border-border shadow-warm">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ItemForm({ initial, onSave, onCancel }: { initial: MenuItem; onSave: (i: MenuItem) => void; onCancel: () => void }) {
  const [item, setItem] = useState(initial);
  return (
    <div className="space-y-4">
      <Field label="Name">
        <input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price ($)">
          <input type="number" step="0.01" value={item.price} onChange={(e) => setItem({ ...item, price: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </Field>
        <Field label="Category">
          <select value={item.category} onChange={(e) => setItem({ ...item, category: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option>Starters</option><option>Mains</option><option>Desserts</option><option>Drinks</option>
          </select>
        </Field>
      </div>
      <Field label="Description">
        <textarea value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none" />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">Cancel</button>
        <button onClick={() => onSave(item)} disabled={!item.name} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary-glow disabled:opacity-50">Save</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}
