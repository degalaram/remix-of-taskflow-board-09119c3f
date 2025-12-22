// Kanban Board Component
// Main board with drag-and-drop support for sections and tasks

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
  // Local state for adding new section
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Get dispatch function
  const dispatch = useDispatch();

  // Get kanban state from Redux store
  const { sections, tasks, isLoading, searchQuery } = useSelector((state) => state.kanban);

  // Filter tasks based on search query
  const getFilteredTasks = (sectionId) => {
    const sectionTasks = tasks[sectionId] || [];
    if (!searchQuery.trim()) {
      return sectionTasks;
    }
    const query = searchQuery.toLowerCase();
    return sectionTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
    );
  };

  // Load kanban data on mount
  useEffect(() => {
    dispatch(loadKanbanRequest());
  }, [dispatch]);

  // Handle drag end event
  // This is the main function that handles all drag-and-drop operations
  const handleDragEnd = (result) => {
    const { destination, source, type } = result;

    // If dropped outside a droppable area, do nothing
    if (!destination) {
      return;
    }

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle section reordering
    if (type === 'section') {
      const newSections = Array.from(sections);
      const [movedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, movedSection);

      // Update order property
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index,
      }));

      dispatch(reorderSectionsRequest(updatedSections));
      return;
    }

    // Handle task reordering/moving
    if (type === 'task') {
      const sourceSectionId = source.droppableId;
      const destSectionId = destination.droppableId;

      // If moving within the same section
      if (sourceSectionId === destSectionId) {
        const sectionTasks = Array.from(tasks[sourceSectionId] || []);
        const [movedTask] = sectionTasks.splice(source.index, 1);
        sectionTasks.splice(destination.index, 0, movedTask);

        dispatch(reorderTasksRequest({
          sectionId: sourceSectionId,
          tasks: sectionTasks,
        }));
      } else {
        // Moving to a different section
        dispatch(moveTaskRequest({
          sourceSectionId,
          destSectionId,
          sourceIndex: source.index,
          destIndex: destination.index,
        }));
      }
    }
  };

  // Handle add section form submission
  const handleAddSection = (e) => {
    e.preventDefault();
    if (newSectionTitle.trim()) {
      dispatch(addSectionRequest({ title: newSectionTitle.trim() }));
      setNewSectionTitle('');
      setIsAddingSection(false);
    }
  };

  // Handle cancel add section
  const handleCancelAddSection = () => {
    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  // Loading state
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

  // Count total filtered tasks
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
      {/* Board Header */}
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

      {/* Board Content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="section" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-3 md:gap-4 px-4 md:px-6 pb-6 overflow-x-auto custom-scrollbar h-[calc(100vh-11rem)] md:h-[calc(100vh-12rem)]"
            >
              {/* Render Sections */}
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

              {/* Add Section Button/Form */}
              <div className="flex-shrink-0 w-72 md:w-80">
                {isAddingSection ? (
                  <form
                    onSubmit={handleAddSection}
                    className="bg-kanban-section rounded-xl border border-border p-4 animate-fade-in"
                  >
                    <input
                      type="text"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="Enter section title..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                      autoFocus
                    />
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
