import React, { createContext, useContext, useState, ReactNode } from "react";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  ipAddress: string;
  models: {
    chatgpt: boolean;
    gpt4oSearch: boolean;
    perplexity: boolean;
    aiOverview: boolean;
    aiMode: boolean;
    gemini: boolean;
    claudeSonnet4: boolean;
  };
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  addWorkspace: (workspace: Omit<Workspace, "id">) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  setCurrentWorkspace: (id: string) => void;
  deleteWorkspace: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({
  children,
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(
    null
  );

  const currentWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) || null;

  const addWorkspace = (workspaceData: Omit<Workspace, "id">) => {
    const newWorkspace: Workspace = {
      ...workspaceData,
      id: Date.now().toString(),
    };
    setWorkspaces((prev) => [...prev, newWorkspace]);
    setCurrentWorkspaceId(newWorkspace.id);
  };

  const updateWorkspace = (id: string, updates: Partial<Workspace>) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === id ? { ...workspace, ...updates } : workspace
      )
    );
  };

  const setCurrentWorkspace = (id: string) => {
    setCurrentWorkspaceId(id);
  };

  const deleteWorkspace = (id: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    if (currentWorkspaceId === id) {
      setCurrentWorkspaceId(workspaces.length > 1 ? workspaces[0].id : null);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        addWorkspace,
        updateWorkspace,
        setCurrentWorkspace,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
