// Kanban Board Component
// Main board with drag-and-drop support for sections and tasks
// SIMPLIFIED VERSION - with clear step-by-step comments

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadKanbanRequest,
  addSectionRequest,
  reorderSectionsRequest,
  moveTaskRequest,
  reorderTasksRequest,
} from '../store/slices/kanbanSlice';
import KanbanSection from './KanbanSection';
import { Plus, X, Loader2 } from 'lucide-react';

const KanbanBoard = () => {
  // STEP 1: State for adding new section
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // STEP 2: Get dispatch function
  const dispatch = useDispatch();

  // STEP 3: Get data from Redux store
  const { sections, tasks, isLoading, searchQuery } = useSelector((state) => state.kanban);

  // STEP 4: Filter tasks based on search query
  const getFilteredTasks = (sectionId) => {
    const sectionTasks = tasks[sectionId] || [];
    
    // If no search query, return all tasks
    if (!searchQuery.trim()) {
      return sectionTasks;
    }
    
    // Filter tasks that match search query
    const query = searchQuery.toLowerCase();
    return sectionTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
    );
  };

  // STEP 5: Load kanban data when component loads
  useEffect(() => {
    dispatch(loadKanbanRequest());
  }, [dispatch]);

  // STEP 6: Handle drag and drop operations
  const handleDragEnd = (result) => {
    const { destination, source, type } = result;

    // Do nothing if dropped outside
    if (!destination) {
      return;
    }

    // Do nothing if dropped in same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle reordering sections
    if (type === 'section') {
      // Make a copy of sections array
      const newSections = Array.from(sections);
      
      // Remove section from old position
      const [movedSection] = newSections.splice(source.index, 1);
      
      // Add section to new position
      newSections.splice(destination.index, 0, movedSection);

      // Update order numbers
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index,
      }));

      // Send update to Redux
      dispatch(reorderSectionsRequest(updatedSections));
      return;
    }

    // Handle tasks
    if (type === 'task') {
      const sourceSectionId = source.droppableId;
      const destSectionId = destination.droppableId;

      // Moving task within same section
      if (sourceSectionId === destSectionId) {
        // Make a copy of tasks in section
        const sectionTasks = Array.from(tasks[sourceSectionId] || []);
        
        // Remove task from old position
        const [movedTask] = sectionTasks.splice(source.index, 1);
        
        // Add task to new position
        sectionTasks.splice(destination.index, 0, movedTask);

        // Send update to Redux
        dispatch(reorderTasksRequest({
          sectionId: sourceSectionId,
          tasks: sectionTasks,
        }));
      } else {
        // Moving task to different section
        dispatch(moveTaskRequest({
          sourceSectionId,
          destSectionId,
          sourceIndex: source.index,
          destIndex: destination.index,
        }));
      }
    }
  };

  // STEP 7: Handle adding new section
  const handleAddSection = (e) => {
    e.preventDefault();
    
    if (newSectionTitle.trim()) {
      // Send add section request to Redux
      dispatch(addSectionRequest({ title: newSectionTitle.trim() }));
      
      // Clear form
      setNewSectionTitle('');
      setIsAddingSection(false);
    }
  };

  // STEP 8: Handle cancel adding section
  const handleCancelAddSection = () => {
    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  // STEP 9: Show loading screen
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // STEP 10: Count tasks for display
  const totalFilteredTasks = sections.reduce(
    (acc, section) => acc + getFilteredTasks(section.id).length,
    0
  );
  const totalTasks = sections.reduce(
    (acc, section) => acc + (tasks[section.id]?.length || 0),
    0
  );

  return (
    <div className="flex-1 overflow-hidden">
      {/* STEP 11: Board Header Section */}
      <div className="p-4 md:p-6 pb-2 md:pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Kanban Board</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          {searchQuery ? (
            <>
              Showing {totalFilteredTasks} of {totalTasks} tasks matching "{searchQuery}"
            </>
          ) : (
            'Drag and drop to organize your tasks'
          )}
        </p>
      </div>

      {/* STEP 12: Drag Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="section" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-2 md:gap-4 px-3 md:px-6 pb-6 overflow-x-auto custom-scrollbar h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)]"
            >
              {/* STEP 13: Render all sections */}
              {sections
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <KanbanSection
                    key={section.id}
                    section={section}
                    tasks={getFilteredTasks(section.id)}
                    allTasks={tasks[section.id] || []}
                    index={index}
                    isFiltering={!!searchQuery}
                  />
                ))}

              {provided.placeholder}

              {/* STEP 14: Add Section Button/Form */}
              <div className="flex-shrink-0 w-72 sm:w-80 md:w-96">
                {isAddingSection ? (
                  // Form to add new section
                  <form
                    onSubmit={handleAddSection}
                    className="bg-kanban-section rounded-xl border border-border p-4 animate-fade-in"
                  >
                    {/* Input for section title */}
                    <input
                      type="text"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="Enter section title..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                      autoFocus
                    />
                    {/* Submit and Cancel buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="submit"
                        disabled={!newSectionTitle.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Section
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddSection}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  // Button to show form
                  <button
                    onClick={() => setIsAddingSection(true)}
                    className="w-full h-12 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-kanban-section/50 hover:bg-kanban-section rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Section
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
