import { create } from "zustand";

interface InboxState {
  selectedConversationId: string | null;
  filterStatus: "all" | "open" | "waiting" | "closed" | "mine" | "unassigned";
  searchQuery: string;
  copilotEnabled: boolean;
  selectConversation: (id: string | null) => void;
  setFilterStatus: (status: InboxState["filterStatus"]) => void;
  setSearchQuery: (query: string) => void;
  toggleCopilot: () => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  selectedConversationId: null,
  filterStatus: "all",
  searchQuery: "",
  copilotEnabled: true,
  selectConversation: (id) => set({ selectedConversationId: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleCopilot: () => set((s) => ({ copilotEnabled: !s.copilotEnabled })),
}));
