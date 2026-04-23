import { create } from "zustand";

interface ConfirmState {
  /** Whether the confirm dialog is visible. */
  isOpen: boolean;
  /** Title text (e.g. "Hapus Data Pelanggan?"). */
  title: string;
  /** Description text below the title. */
  description: string;
  /** Label for the confirm button. Defaults to "Hapus". */
  confirmLabel: string;
  /** Label for the cancel button. Defaults to "Batal". */
  cancelLabel: string;
  /** Whether the confirm action is in progress (shows loading spinner). */
  isLoading: boolean;
  /** Callback executed when the user confirms. */
  onConfirm: (() => void | Promise<void>) | null;

  /**
   * Open the confirm dialog with the given options.
   * Returns a promise that resolves to `true` if confirmed, `false` if cancelled.
   */
  showConfirm: (options: {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
  }) => void;

  /** Close the dialog without confirming. */
  hideConfirm: () => void;

  /** Set the loading state (used internally by the dialog component). */
  setLoading: (loading: boolean) => void;
}

/**
 * Global confirm dialog store.
 *
 * Call `showConfirm()` from anywhere to open a confirmation popup.
 * The `ConfirmDialog` component (mounted in the root layout) renders the UI.
 *
 * @example
 * ```tsx
 * const { showConfirm } = useConfirmStore();
 * showConfirm({
 *   title: "Delete member?",
 *   description: "This action cannot be undone.",
 *   onConfirm: async () => {
 *     await memberService.delete(id);
 *   },
 * });
 * ```
 */
export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  confirmLabel: "Hapus",
  cancelLabel: "Batal",
  isLoading: false,
  onConfirm: null,

  showConfirm: ({ title, description, confirmLabel, cancelLabel, onConfirm }) =>
    set({
      isOpen: true,
      title,
      description,
      confirmLabel: confirmLabel ?? "Hapus",
      cancelLabel: cancelLabel ?? "Batal",
      isLoading: false,
      onConfirm,
    }),

  hideConfirm: () =>
    set({
      isOpen: false,
      isLoading: false,
      onConfirm: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
