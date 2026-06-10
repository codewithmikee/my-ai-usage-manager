import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Plus, Settings2, Trash2, Bell, BellOff, Moon, Sun, Download, Upload, AlertCircle, Menu, X, LogOut } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { EditableText } from '@/components/EditableText';
import { AccountRow } from '@/components/AccountRow';
import { isPast, formatDistanceToNow } from 'date-fns';
import { NotificationManager } from '@/components/NotificationManager';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/authStore';
import { LoginPage } from '@/components/LoginPage';
import { SupabaseSync } from '@/components/SupabaseSync';
import { SyncIndicator } from '@/components/SyncIndicator';
import { useAppTicker } from '@/lib/ticker';
import { SettingsPopover } from '@/components/SettingsPopover';
import { PRESET_CYCLES, Cycle } from '@/lib/cycles';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CycleManager } from '@/components/CycleManager';
import { Input } from '@/components/ui/input';

export default function App() {
  useAppTicker();
  const { user, loading: authLoading, signOut } = useAuthStore();
  const products = useStore((state) => state.products) || [];
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const removeProduct = useStore((state) => state.removeProduct);
  const addAccount = useStore((state) => state.addAccount);
  const addCycle = useStore((state) => state.addCycle);
  const removeCycle = useStore((state) => state.removeCycle);
  const updateCycle = useStore((state) => state.updateCycle);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const importData = useStore((state) => state.importData);

  const [selectedProductId, setSelectedProductId] = useState<string | null>((products || [])[0]?.id || null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [pendingImport, setPendingImport] = useState<{ products: any[]; fileName: string } | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newToolName, setNewToolName] = useState('');
  const [isAddingTool, setIsAddingTool] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Always render SupabaseSync (it bootstraps auth), gate the rest
  if (authLoading) {
    return (
      <>
        <SupabaseSync />
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-background">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 dark:border-white/20 dark:border-t-white rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SupabaseSync />
        <LoginPage />
        <Toaster position="bottom-right" richColors theme={theme as any || 'system'} />
      </>
    );
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(products, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `limit-tracker-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Backup exported successfully');
    } catch (err) {
      toast.error('Failed to export backup data');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        let parsedProducts = null;
        if (Array.isArray(json)) {
          parsedProducts = json;
        } else if (json && typeof json === 'object' && Array.isArray(json.products)) {
          parsedProducts = json.products;
        }

        if (!parsedProducts || parsedProducts.length === 0) {
          toast.error('No valid tools or accounts found in backup file.');
          return;
        }

        const hasValidFormat = parsedProducts.some((p: any) => p && typeof p === 'object' && typeof p.name === 'string');
        if (!hasValidFormat) {
          toast.error('Invalid backup file format.');
          return;
        }

        setPendingImport({
          products: parsedProducts,
          fileName: file.name
        });
        toast.info('Backup loaded! Choose Overwrite or Merge in sidebar.');
      } catch (err) {
        toast.error('Failed to parse backup file as JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedProduct = (products || []).find(p => p.id === selectedProductId) || (products || [])[0];

  const sortedAccounts = selectedProduct
    ? [...selectedProduct.accounts].sort((a, b) => {
      const aHasReached = Object.values(a.sessions || {}).some(s => s.state === 'reached');
      const bHasReached = Object.values(b.sessions || {}).some(s => s.state === 'reached');
      if (aHasReached === bHasReached) return 0;
      return aHasReached ? 1 : -1;
    })
    : [];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F9FAFB] dark:bg-background text-[#111827] dark:text-foreground transition-colors selection:bg-muted py-4 md:py-2">
      <SupabaseSync />
      <NotificationManager />

      {/* Standard App Title Bar */}
      <header className="h-14 w-full flex-shrink-0 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950 flex items-center px-4 md:px-6 justify-between select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
              <div className="w-3.5 h-0.5 bg-white dark:bg-black rounded-full"></div>
            </div>
            <span className="font-semibold text-sm tracking-tight text-gray-900 dark:text-gray-100">
              LimitTracker
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
          <button
            onClick={() => updateSettings({ showCountdown: !settings.showCountdown })}
            className={cn(
              "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center h-8 w-8",
              settings.showCountdown ? "text-green-600 dark:text-green-400" : "text-gray-400 hover:text-gray-950 dark:hover:text-gray-50"
            )}
            title="Toggle Countdown Style"
          >
            <span className="font-mono text-[10px] font-bold border border-current px-1 rounded-[3px] leading-none mb-[1px]">00</span>
          </button>

          <button
            onClick={notificationPermission !== 'granted' ? requestNotificationPermission : undefined}
            className={cn(
              "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center h-8 w-8",
              notificationPermission === 'granted' ? "text-emerald-500 dark:text-emerald-400" : "text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            )}
            title={notificationPermission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
          >
            {notificationPermission === 'granted' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 mx-1"></div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-950 dark:hover:text-gray-50 transition-colors cursor-pointer flex items-center justify-center h-8 w-8"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <SettingsPopover />

          <SyncIndicator />

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 mx-1"></div>

          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer flex items-center justify-center h-8 w-8"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 md:hidden z-40 transition-opacity animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside className={cn(
          "fixed inset-y-0 left-0 w-64 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950 flex flex-col flex-shrink-0 transition-transform duration-300 z-50 md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Tools</h2>
            <nav className="space-y-0.5">
              {/* Tool list */}
              {products.map(product => {
                const availableCount = product.accounts.filter(a => {
                  const sessions = a.sessions || {};
                  const reachedSessions = Object.values(sessions).filter(s => s.state === 'reached');
                  return reachedSessions.length === 0;
                }).length;

                const allAvailableAts = product.accounts.flatMap(a =>
                  Object.values(a.sessions || {})
                    .filter((s): s is typeof s & { availableAt: number } => s.state === 'reached' && s.availableAt !== null && s.availableAt > Date.now())
                    .map(s => s.availableAt as number)
                );
                const nextUnlock = allAvailableAts.length > 0 ? Math.min(...allAvailableAts) : null;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "flex flex-col p-2 rounded-lg group cursor-pointer transition-colors mb-0.5",
                      selectedProduct?.id === product.id ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <EditableText
                        value={product.name}
                        onChange={(val) => {
                          updateProduct(product.id, val);
                          setEditingProductId(null);
                        }}
                        textClassName="text-sm font-medium truncate flex-1"
                        trigger="doubleClick"
                        autoFocus={product.id === editingProductId}
                      />
                      {availableCount > 0 && (
                        <span className="text-[10px] bg-green-100 dark:bg-emerald-500/20 text-green-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium flex-shrink-0 ml-2">
                          {availableCount} Ready
                        </span>
                      )}
                    </div>
                    {nextUnlock && availableCount < product.accounts.length && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 pl-0.5">
                        Next unlock in {formatDistanceToNow(nextUnlock)}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Inline add tool */}
              {isAddingTool ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newToolName.trim()) return;
                    const newId = addProduct(newToolName.trim());
                    setSelectedProductId(newId);
                    setNewToolName('');
                    setIsAddingTool(false);
                    toast.success(`Added ${newToolName}`);
                  }}
                  className="mt-4 flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700/50"
                >
                  <Plus className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    placeholder="Tool name..."
                    autoFocus
                    className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-0.5"
                  />
                  <button
                    type="submit"
                    disabled={!newToolName.trim()}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                    title="Create"
                  >
                    ↵
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTool(false);
                      setNewToolName('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <div
                  onClick={() => setIsAddingTool(true)}
                  className="flex items-center p-2 mt-4 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg group cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">New Tool</span>
                </div>
              )}
            </nav>
          </div>

          {/* Sidebar footer for backup/restore */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-900/10 flex flex-col gap-3">
            {pendingImport ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/25 rounded-lg border border-blue-100 dark:border-blue-900/30 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-blue-950 dark:text-blue-300">Backup Loaded</p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 truncate mt-0.5">{pendingImport.fileName}</p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-1">{pendingImport.products.length} tools detected</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  <button
                    onClick={() => {
                      const res = importData(pendingImport.products, true);
                      if (res.success) {
                        toast.success(`Successfully imported ${res.count} tools!`);
                        if (pendingImport.products.length > 0) {
                          setSelectedProductId(pendingImport.products[0].id);
                        }
                      } else {
                        toast.error("Failed to import backup");
                      }
                      setPendingImport(null);
                    }}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded-md transition-colors text-center cursor-pointer shadow-sm active:scale-95"
                  >
                    Overwrite
                  </button>
                  <button
                    onClick={() => {
                      const res = importData(pendingImport.products, false);
                      if (res.success) {
                        toast.success(`Successfully merged ${res.count} tools!`);
                      } else {
                        toast.error("Failed to merge backup");
                      }
                      setPendingImport(null);
                    }}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-md transition-colors text-center cursor-pointer shadow-sm active:scale-95"
                  >
                    Merge
                  </button>
                </div>
                <button
                  onClick={() => {
                    setPendingImport(null);
                    toast.info("Import cancelled");
                  }}
                  className="w-full text-center text-[10px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mt-0.5 transition-colors cursor-pointer"
                >
                  Cancel Import
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">Backup / Restore</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-lg hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer shadow-sm active:scale-98"
                    title="Export Backup to JSON File"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Export</span>
                  </button>

                  <label
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-lg hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer shadow-sm active:scale-98"
                    title="Import Backup from JSON File"
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Import</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-background transition-colors">
          {selectedProduct ? (
            <>
              <header className="min-h-24 px-4 md:px-10 flex flex-col justify-end pb-4 flex-shrink-0 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex flex-col group min-w-0">
                    <EditableText
                      value={selectedProduct.name}
                      onChange={(val) => updateProduct(selectedProduct.id, val)}
                      textClassName="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 truncate pr-4"
                      trigger="doubleClick"
                    />
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Double click to rename. Add ranges and credentials below.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 -mb-1"
                    onClick={() => {
                      const toRemove = selectedProduct.id;
                      const index = products.findIndex(p => p.id === toRemove);
                      removeProduct(toRemove);
                      if (products.length > 1) {
                        setSelectedProductId(products[index === 0 ? 1 : 0].id);
                      } else {
                        setSelectedProductId(null);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Tool
                  </Button>
                </div>
              </header>

              <div className="flex-1 overflow-auto px-4 md:px-10 pb-10">
                <div className="flex flex-col gap-2 max-w-4xl">
                  {/* Cycle Manager */}
                  <CycleManager
                    cycles={selectedProduct.cycles}
                    onAddCycle={(cycle) => addCycle(selectedProduct.id, cycle)}
                    onRemoveCycle={(cycleId) => removeCycle(selectedProduct.id, cycleId)}
                    onUpdateCycle={(cycleId, updates) => updateCycle(selectedProduct.id, cycleId, updates)}
                  />

                  {/* Credentials section */}
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-3 mb-2">Credentials</h3>

                  {selectedProduct.accounts.length === 0 ? (
                    <div className="flex flex-col gap-3 py-4">
                      <div className="text-center py-10 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/20 dark:bg-zinc-950/20">
                        <p className="text-gray-400 dark:text-gray-500 text-sm">No credentials configured for this tool yet.</p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newAccountName.trim()) return;
                          addAccount(selectedProduct.id, newAccountName.trim());
                          setNewAccountName('');
                          toast.success('Credential added');
                        }}
                        className="flex items-center px-4 py-3 rounded-xl transition-all bg-transparent border border-dashed border-gray-250 dark:border-white/10 focus-within:border-gray-400 dark:focus-within:border-white/30 focus-within:bg-gray-50/30 dark:focus-within:bg-white/5"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Plus className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <input
                            type="text"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            placeholder="Type first credential name and press Enter..."
                            className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-0.5"
                            autoFocus
                          />
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-0.5">
                        {sortedAccounts.map((account) => (
                          <AccountRow key={account.id} productId={selectedProduct.id} account={account} />
                        ))}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newAccountName.trim()) return;
                          addAccount(selectedProduct.id, newAccountName.trim());
                          setNewAccountName('');
                          toast.success('Credential added');
                        }}
                        className="flex items-center px-4 py-3 rounded-xl transition-all bg-transparent border border-dashed border-gray-250 dark:border-white/10 focus-within:border-gray-400 dark:focus-within:border-white/30 focus-within:bg-gray-50/30 dark:focus-within:bg-white/5 mt-2"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Plus className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <input
                            type="text"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            placeholder="Type credential name and press Enter..."
                            className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-0.5"
                          />
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Settings2 className="w-12 h-12 mb-4 opacity-20" />
              <p>Select or add a tool from the sidebar.</p>
            </div>
          )}
        </main>

      </div>
      <Toaster position="bottom-right" richColors theme={theme as any || 'system'} />
    </div>
  );
}
