// Kanban Section Component
// A column in the Kanban board containing tasks

import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useDispatch } from 'react-redux';
import { 
  deleteSectionRequest, 
  updateSectionRequest 
} from '../store/slices/kanbanSlice';
import TaskCard from './TaskCard';
import AddTaskForm from './AddTaskForm';
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  GripVertical,
  X,
  Check
} from 'lucide-react';

const KanbanSection = ({ section, tasks, allTasks, index, isFiltering }) => {
  // Local state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  // Get dispatch function
  const dispatch = useDispatch();

  // Get section color based on title
  const getSectionColor = () => {
    const title = section.title.toLowerCase();
    if (title.includes('done') || title.includes('complete')) {
      return 'done';
    }
    if (title.includes('progress') || title.includes('doing')) {
      return 'inprogress';
    }
    return 'todo';
  };

  const colorClass = getSectionColor();
  const colorClasses = {
    todo: 'bg-todo',
    inprogress: 'bg-inprogress',
    done: 'bg-done',
  };

  // Handle delete section
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this section and all its tasks?')) {
      dispatch(deleteSectionRequest(section.id));
    }
    setIsMenuOpen(false);
  };

  // Handle edit start
  const handleEditStart = () => {
    setEditTitle(section.title);
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  // Handle edit save
  const handleEditSave = () => {
    if (editTitle.trim()) {
      dispatch(updateSectionRequest({
        id: section.id,
        title: editTitle.trim(),
      }));
      setIsEditing(false);
    }
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(section.title);
  };

  // Handle key press in edit input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex-shrink-0 w-72 md:w-80 bg-kanban-section rounded-xl border border-border flex flex-col max-h-full transition-shadow ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
          }`}
        >
          {/* Section Header */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center gap-2 p-3 border-b border-border cursor-grab active:cursor-grabbing"
          >
            {/* Color Indicator */}
            <div className={`w-1 h-6 rounded-full ${colorClasses[colorClass]}`} />

            {/* Section Title */}
            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 px-2 py-1 text-sm font-semibold rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <button
                  onClick={handleEditSave}
                  className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="p-1 rounded text-muted-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {section.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isFiltering ? (
                      <>
                        {tasks.length} of {allTasks?.length || 0} {allTasks?.length === 1 ? 'task' : 'tasks'}
                      </>
                    ) : (
                      <>
                        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                      </>
                    )}
                  </p>
                </div>

                {/* Drag Handle Icon */}
                <GripVertical className="w-4 h-4 text-muted-foreground opacity-50" />

                {/* Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-8 z-20 w-36 bg-popover border border-border rounded-lg shadow-lg py-1 animate-fade-in">
                        <button
                          onClick={handleEditStart}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                          onClick={handleDelete}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Tasks List - Droppable Area */}
          <Droppable droppableId={section.id} type="task">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto p-3 min-h-[100px] custom-scrollbar transition-colors ${
                  snapshot.isDraggingOver ? 'bg-primary/5' : ''
                }`}
              >
                {/* Add Task Form */}
                {isAddingTask && (
                  <AddTaskForm
                    sectionId={section.id}
                    onClose={() => setIsAddingTask(false)}
                  />
                )}

                {/* Task Cards */}
                {tasks.map((task, taskIndex) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={taskIndex}
                    sectionId={section.id}
                  />
                ))}

                {provided.placeholder}

                {/* Empty State */}
                {tasks.length === 0 && !isAddingTask && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      {isFiltering ? 'No matching tasks' : 'No tasks yet'}
                    </p>
                    {!isFiltering && (
                      <p className="text-xs mt-1">Click + to add a task</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Droppable>

          {/* Add Task Button */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanSection;
