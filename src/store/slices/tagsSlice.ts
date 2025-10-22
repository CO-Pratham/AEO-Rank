import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
  mentions: number;
  promptIds: number[]; // Track which prompts use this tag
}

interface TagsState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  loading: false,
  error: null,
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.tags = action.payload;
    },
    addTag: (state, action: PayloadAction<Omit<Tag, 'id' | 'mentions' | 'promptIds'>>) => {
      const newTag: Tag = {
        ...action.payload,
        id: state.tags.length > 0 ? Math.max(...state.tags.map(t => t.id)) + 1 : 1,
        mentions: 0,
        promptIds: [],
      };
      state.tags.push(newTag);
    },
    updateTag: (state, action: PayloadAction<{ id: number; updates: Partial<Tag> }>) => {
      const index = state.tags.findIndex(tag => tag.id === action.payload.id);
      if (index !== -1) {
        state.tags[index] = { ...state.tags[index], ...action.payload.updates };
      }
    },
    deleteTag: (state, action: PayloadAction<number>) => {
      state.tags = state.tags.filter(tag => tag.id !== action.payload);
    },
    incrementTagMentions: (state, action: PayloadAction<{ tagNames: string[]; promptId: number }>) => {
      const { tagNames, promptId } = action.payload;
      
      tagNames.forEach(tagName => {
        const existingTagIndex = state.tags.findIndex(t => t.name.toLowerCase() === tagName.toLowerCase());
        
        if (existingTagIndex !== -1) {
          // Existing tag - increment mentions and add promptId
          const tag = state.tags[existingTagIndex];
          if (!tag.promptIds.includes(promptId)) {
            tag.mentions += 1;
            tag.promptIds.push(promptId);
          }
        } else {
          // New tag - create it automatically
          const colors = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#14b8a6'];
          const newTag: Tag = {
            id: state.tags.length > 0 ? Math.max(...state.tags.map(t => t.id)) + 1 : 1,
            name: tagName,
            color: colors[Math.floor(Math.random() * colors.length)],
            description: '',
            mentions: 1,
            promptIds: [promptId],
          };
          state.tags.push(newTag);
        }
      });
    },
    decrementTagMentions: (state, action: PayloadAction<{ tagNames: string[]; promptId: number }>) => {
      const { tagNames, promptId } = action.payload;
      
      tagNames.forEach(tagName => {
        const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        if (tag) {
          tag.promptIds = tag.promptIds.filter(id => id !== promptId);
          tag.mentions = tag.promptIds.length;
        }
      });
    },
    syncTagsFromPrompts: (state, action: PayloadAction<{ promptId: number; oldTags: string[]; newTags: string[] }>) => {
      const { promptId, oldTags, newTags } = action.payload;
      
      // Remove old tags
      oldTags.forEach(tagName => {
        const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        if (tag) {
          tag.promptIds = tag.promptIds.filter(id => id !== promptId);
          tag.mentions = tag.promptIds.length;
        }
      });
      
      // Add new tags
      newTags.forEach(tagName => {
        const existingTag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        
        if (existingTag) {
          if (!existingTag.promptIds.includes(promptId)) {
            existingTag.promptIds.push(promptId);
            existingTag.mentions = existingTag.promptIds.length;
          }
        } else {
          const colors = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#14b8a6'];
          const newTag: Tag = {
            id: state.tags.length > 0 ? Math.max(...state.tags.map(t => t.id)) + 1 : 1,
            name: tagName,
            color: colors[Math.floor(Math.random() * colors.length)],
            description: '',
            mentions: 1,
            promptIds: [promptId],
          };
          state.tags.push(newTag);
        }
      });
    },
  },
});

export const {
  setLoading,
  setError,
  setTags,
  addTag,
  updateTag,
  deleteTag,
  incrementTagMentions,
  decrementTagMentions,
  syncTagsFromPrompts,
} = tagsSlice.actions;

export default tagsSlice.reducer;

