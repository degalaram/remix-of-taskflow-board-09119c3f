// Kanban Slice - Manages Kanban board state using Redux Toolkit
// Handles sections, tasks, and their ordering

import { createSlice } from '@reduxjs/toolkit';

// Helper function to generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to get kanban data from localStorage
const getStoredKanbanData = () => {
  try {
    const data = localStorage.getItem('taskflow_kanban');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading kanban data from localStorage:', error);
  }
  return null;
};

// Default sections when no data exists
const defaultSections = [
  { id: 'section-1', title: 'To Do', order: 0 },
  { id: 'section-2', title: 'In Progress', order: 1 },
  { id: 'section-3', title: 'Done', order: 2 },
];

// Get stored data or use defaults
const storedData = getStoredKanbanData();

// Initial state for kanban board
const initialState = {
  // Array of section objects
  sections: storedData?.sections || defaultSections,
  // Object containing tasks keyed by section ID
  tasks: storedData?.tasks || {
    'section-1': [],
    'section-2': [],
    'section-3': [],
  },
  // Loading state for API simulation
  isLoading: false,
  // Saving state for persistence
  isSaving: false,
  // Error message
  error: null,
  // Search query for filtering tasks
  searchQuery: '',
};

// Create the kanban slice
const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    // === LOADING ACTIONS ===
    loadKanbanRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loadKanbanSuccess: (state, action) => {
      state.isLoading = false;
      state.sections = action.payload.sections;
      state.tasks = action.payload.tasks;
    },
    loadKanbanFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // === SECTION ACTIONS ===
    addSectionRequest: (state) => {
      state.isSaving = true;
    },
    addSectionSuccess: (state, action) => {
      state.isSaving = false;
      const newSection = action.payload;
      state.sections.push(newSection);
      // Initialize empty task array for new section
      state.tasks[newSection.id] = [];
    },
    
    updateSectionRequest: (state) => {
      state.isSaving = true;
    },
    updateSectionSuccess: (state, action) => {
      state.isSaving = false;
      const { id, title } = action.payload;
      const section = state.sections.find((s) => s.id === id);
      if (section) {
        section.title = title;
      }
    },

    deleteSectionRequest: (state) => {
      state.isSaving = true;
    },
    deleteSectionSuccess: (state, action) => {
      state.isSaving = false;
      const sectionId = action.payload;
      state.sections = state.sections.filter((s) => s.id !== sectionId);
      delete state.tasks[sectionId];
    },

    reorderSectionsRequest: (state) => {
      state.isSaving = true;
    },
    reorderSectionsSuccess: (state, action) => {
      state.isSaving = false;
      state.sections = action.payload;
    },

    // === TASK ACTIONS ===
    addTaskRequest: (state) => {
      state.isSaving = true;
    },
    addTaskSuccess: (state, action) => {
      state.isSaving = false;
      const { sectionId, task } = action.payload;
      if (!state.tasks[sectionId]) {
        state.tasks[sectionId] = [];
      }
      state.tasks[sectionId].push(task);
    },

    updateTaskRequest: (state) => {
      state.isSaving = true;
    },
    updateTaskSuccess: (state, action) => {
      state.isSaving = false;
      const { sectionId, taskId, updates } = action.payload;
      const tasks = state.tasks[sectionId];
      if (tasks) {
        const taskIndex = tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[sectionId][taskIndex] = {
            ...state.tasks[sectionId][taskIndex],
            ...updates,
          };
        }
      }
    },

    deleteTaskRequest: (state) => {
      state.isSaving = true;
    },
    deleteTaskSuccess: (state, action) => {
      state.isSaving = false;
      const { sectionId, taskId } = action.payload;
      if (state.tasks[sectionId]) {
        state.tasks[sectionId] = state.tasks[sectionId].filter(
          (t) => t.id !== taskId
        );
      }
    },

    moveTaskRequest: (state) => {
      state.isSaving = true;
    },
    moveTaskSuccess: (state, action) => {
      state.isSaving = false;
      const { sourceSectionId, destSectionId, sourceIndex, destIndex } = action.payload;
      
      // Get the task being moved
      const task = state.tasks[sourceSectionId][sourceIndex];
      
      // Remove from source
      state.tasks[sourceSectionId].splice(sourceIndex, 1);
      
      // Add to destination
      if (!state.tasks[destSectionId]) {
        state.tasks[destSectionId] = [];
      }
      state.tasks[destSectionId].splice(destIndex, 0, {
        ...task,
        status: destSectionId,
      });
    },

    reorderTasksRequest: (state) => {
      state.isSaving = true;
    },
    reorderTasksSuccess: (state, action) => {
      state.isSaving = false;
      const { sectionId, tasks } = action.payload;
      state.tasks[sectionId] = tasks;
    },

    // Generic save completion
    saveComplete: (state) => {
      state.isSaving = false;
    },
    saveError: (state, action) => {
      state.isSaving = false;
      state.error = action.payload;
    },
    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

// Export all actions
export const {
  loadKanbanRequest,
  loadKanbanSuccess,
  loadKanbanFailure,
  addSectionRequest,
  addSectionSuccess,
  updateSectionRequest,
  updateSectionSuccess,
  deleteSectionRequest,
  deleteSectionSuccess,
  reorderSectionsRequest,
  reorderSectionsSuccess,
  addTaskRequest,
  addTaskSuccess,
  updateTaskRequest,
  updateTaskSuccess,
  deleteTaskRequest,
  deleteTaskSuccess,
  moveTaskRequest,
  moveTaskSuccess,
  reorderTasksRequest,
  reorderTasksSuccess,
  saveComplete,
  saveError,
  setSearchQuery,
} = kanbanSlice.actions;

// Export reducer
export default kanbanSlice.reducer;
