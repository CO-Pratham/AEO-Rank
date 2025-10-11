import { createContext, useContext, useState, ReactNode } from "react";

export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
  mentions: number;
}

interface TagsContextType {
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id' | 'mentions'>) => void;
  updateTag: (id: number, updates: Partial<Tag>) => void;
  deleteTag: (id: number) => void;
  incrementTagMentions: (tagNames: string[]) => void;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export const TagsProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>([]);

  const addTag = (tag: Omit<Tag, 'id' | 'mentions'>) => {
    const newTag: Tag = {
      ...tag,
      id: tags.length > 0 ? Math.max(...tags.map(t => t.id)) + 1 : 1,
      mentions: 0,
    };
    setTags([...tags, newTag]);
  };

  const updateTag = (id: number, updates: Partial<Tag>) => {
    setTags(tags.map(tag => tag.id === id ? { ...tag, ...updates } : tag));
  };

  const deleteTag = (id: number) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  const incrementTagMentions = (tagNames: string[]) => {
    setTags(prevTags => {
      const updatedTags = [...prevTags];
      const existingTagNames = prevTags.map(t => t.name);
      
      tagNames.forEach(tagName => {
        const existingTagIndex = updatedTags.findIndex(t => t.name === tagName);
        
        if (existingTagIndex !== -1) {
          updatedTags[existingTagIndex] = {
            ...updatedTags[existingTagIndex],
            mentions: updatedTags[existingTagIndex].mentions + 1
          };
        } else {
          const newTag: Tag = {
            id: updatedTags.length > 0 ? Math.max(...updatedTags.map(t => t.id)) + 1 : 1,
            name: tagName,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
            description: '',
            mentions: 1
          };
          updatedTags.push(newTag);
        }
      });
      
      return updatedTags;
    });
  };

  return (
    <TagsContext.Provider value={{ tags, addTag, updateTag, deleteTag, incrementTagMentions }}>
      {children}
    </TagsContext.Provider>
  );
};

export const useTags = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error("useTags must be used within a TagsProvider");
  }
  return context;
};
