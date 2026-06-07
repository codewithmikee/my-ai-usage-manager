import React, { useState } from 'react';
import { Account, useStore } from '@/lib/store';
import { EditableText } from './EditableText';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionItem } from './SessionItem';
import { toast } from 'sonner';
import { AddSessionModal } from './AddSessionModal';
import { ConfirmDialog } from './ConfirmDialog';

interface AccountRowProps {
  productId: string;
  account: Account;
}

export function AccountRow({ productId, account }: AccountRowProps) {
  const updateAccount = useStore((state) => state.updateAccount);
  const removeAccount = useStore((state) => state.removeAccount);
  const addSession = useStore((state) => state.addSession);
  const removeSession = useStore((state) => state.removeSession);
  const toggleSessionState = useStore((state) => state.toggleSessionState);
  const setSessionAvailableAt = useStore((state) => state.setSessionAvailableAt);

  const product = useStore((state) => state.products.find(p => p.id === productId));
  const cycles = product?.cycles || [];

  const [isHovered, setIsHovered] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sessions = account.sessions || {};
  const attachedCycles = Object.keys(sessions).map(cid => cycles.find(c => c.id === cid)).filter(Boolean);
  const availableCycles = cycles.filter(c => !sessions[c.id]);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors group relative bg-transparent hover:bg-gray-50/60 dark:hover:bg-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Credential name */}
      <div className="min-w-0">
        <EditableText
          value={account.name}
          onChange={(val) => updateAccount(productId, account.id, val)}
          textClassName={cn(
            "text-sm font-medium tracking-tight transition-colors duration-200 block whitespace-nowrap",
            "text-gray-800 dark:text-gray-200"
          )}
          trigger="doubleClick"
        />
      </div>

      {/* Session items on same row */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
        {attachedCycles.map((cycle) => {
          if (!cycle) return null;
          const session = sessions[cycle.id]!;
          return (
            <SessionItem
              key={cycle.id}
              cycleId={cycle.id}
              session={session}
              cycle={cycle}
              onToggle={() => toggleSessionState(productId, account.id, cycle.id)}
              onRemove={() => {
                removeSession(productId, account.id, cycle.id);
                toast.info(`Removed ${cycle.name} from ${account.name}`);
              }}
              onUpdateTime={(time) => setSessionAvailableAt(productId, account.id, cycle.id, time)}
            />
          );
        })}
      </div>

      {/* Add session button */}
      {availableCycles.length > 0 && (
        <>
          <button
            onClick={() => setShowAddSessionModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded transition-all text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            title="Add range"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <AddSessionModal
            open={showAddSessionModal}
            onOpenChange={setShowAddSessionModal}
            cycles={availableCycles}
            onAddSession={(cycleId, availableAt, isReached) => {
              addSession(productId, account.id, cycleId);
              if (isReached && availableAt) {
                setSessionAvailableAt(productId, account.id, cycleId, availableAt);
              }
              setShowAddSessionModal(false);
              toast.success(`Added session range`);
            }}
          />
        </>
      )}

      {/* Delete button */}
      {isHovered && (
        <>
          <button
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 transition-colors cursor-pointer flex-shrink-0"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete credential"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <ConfirmDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            title="Remove Credential"
            description={`Are you sure you want to remove "${account.name}"? This will delete all session data for this credential. This action cannot be undone.`}
            confirmLabel="Remove"
            isDangerous
            onConfirm={() => {
              removeAccount(productId, account.id);
              toast.info(`Removed ${account.name}`);
            }}
          />
        </>
      )}
    </div>
  );
}
