import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Eye, X, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type MenuItem = {
  _id?: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string;
};

export const Route = createFileRoute("/menu")({
  head: () => ({ meta: [{ title: "Menu · Ember & Oak" }] }),
  component: MenuPage,
});

const empty: Omit<MenuItem, "_id"> = { name: "", price: 0, category: "Mains", description: "" };

function MenuPage() {
  const [adding, setAdding] = useState<boolean>(false);
  const [preview, setPreview] = useState(false);
  const { restaurantId } = useAuth();
  const queryClient = useQueryClient();

  const { data: menus, isLoading } = useQuery({
    queryKey: ["menus", restaurantId],
    queryFn: async () => {
      const res = await api.get(`/menus/restaurant/${restaurantId}`);
      return res.data;
    },
    enabled: !!restaurantId,
  });

  const menuObj = menus && menus.length > 0 ? menus[0] : null;
  const items: MenuItem[] = menuObj ? menuObj.items : [];

  const createMenuMutation = useMutation({
    mutationFn: async (item: any) => {
      await api.post("/menus", {
        restaurantId,
        items: [item],
      });
    },
    onSuccess: () => {
      toast.success("Item added!");
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setAdding(false);
    },
    onError: () => toast.error("Failed to add item"),
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      await api.patch(`/menus/${menuObj._id}/items`, { items: [item] });
    },
    onSuccess: () => {
      toast.success("Item added!");
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setAdding(false);
    },
    onError: () => toast.error("Failed to add item"),
  });

  const save = (item: any) => {
    if (!menuObj) {
      createMenuMutation.mutate(item);
    } else {
      addItemMutation.mutate(item);
    }
  };

  const categories = Array.from(new Set(items.map((i) => i.category || "Mains")));

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
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-glow"
          >
            <Plus className="h-4 w-4" /> Add item
          </button>
        </>
      }
    >
      {isLoading ? (
        <div className="py-20 flex justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div
              key={item._id || idx}
              className="rounded-2xl bg-card border border-border p-5 shadow-soft hover:shadow-warm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {item.category || "Mains"}
                  </span>
                  <h3 className="font-display text-lg mt-2 truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <span className="font-display text-xl text-primary shrink-0">
                  ${(item.price || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
              Your menu is empty. Add some items!
            </div>
          )}
        </div>
      )}

      {adding && (
        <Modal onClose={() => setAdding(false)} title="New item">
          <ItemForm
            initial={empty}
            onSave={save}
            onCancel={() => setAdding(false)}
            isLoading={createMenuMutation.isPending || addItemMutation.isPending}
          />
        </Modal>
      )}

      {preview && (
        <Modal onClose={() => setPreview(false)} title="Customer preview">
          <div className="rounded-xl bg-gradient-cream p-5">
            <p className="text-center font-display text-2xl">Ember & Oak</p>
            <p className="text-center text-xs text-muted-foreground mb-4">Digital Menu</p>
            {categories.map((cat) => (
              <div key={cat} className="mb-5">
                <h4 className="font-display text-sm uppercase tracking-widest text-primary mb-2">
                  {cat}
                </h4>
                <ul className="space-y-2">
                  {items
                    .filter((i) => (i.category || "Mains") === cat)
                    .map((i, idx) => (
                      <li
                        key={i._id || idx}
                        className="flex justify-between gap-3 pb-2 border-b border-dashed border-border"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{i.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {i.description}
                          </p>
                        </div>
                        <span className="text-sm font-display text-primary shrink-0">
                          ${(i.price || 0).toFixed(2)}
                        </span>
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

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-2xl bg-card border border-border shadow-warm"
      >
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ItemForm({
  initial,
  onSave,
  onCancel,
  isLoading,
}: {
  initial: any;
  onSave: (i: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [item, setItem] = useState(initial);
  return (
    <div className="space-y-4">
      <Field label="Name">
        <input
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          disabled={isLoading}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price ($)">
          <input
            type="number"
            step="0.01"
            value={item.price}
            onChange={(e) => setItem({ ...item, price: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            disabled={isLoading}
          />
        </Field>
        <Field label="Category">
          <select
            value={item.category}
            onChange={(e) => setItem({ ...item, category: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            disabled={isLoading}
          >
            <option>Starters</option>
            <option>Mains</option>
            <option>Desserts</option>
            <option>Drinks</option>
          </select>
        </Field>
      </div>
      <Field label="Description">
        <textarea
          value={item.description}
          onChange={(e) => setItem({ ...item, description: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
          disabled={isLoading}
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(item)}
          disabled={!item.name || isLoading}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary-glow disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
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
