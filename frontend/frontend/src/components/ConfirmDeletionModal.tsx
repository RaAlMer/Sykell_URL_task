import { Dialog } from "@headlessui/react";

interface ConfirmDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}

export default function ConfirmDeletionModal({
  isOpen,
  onClose,
  onConfirm,
  count,
}: ConfirmDeletionModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-lg z-50 max-w-sm mx-auto">
        <Dialog.Title className="text-lg font-semibold mb-2">Delete Confirmation</Dialog.Title>
        <Dialog.Description className="mb-4 text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <strong>{count}</strong> selected URL{count > 1 ? "s" : ""}?
        </Dialog.Description>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </Dialog>
  );
}
