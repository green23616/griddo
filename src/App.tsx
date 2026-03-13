import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'motion/react';
import { 
  Briefcase, User, Heart, Lightbulb, DollarSign, HomeIcon, 
  Plane, Book, Dumbbell, Users, Folder as FolderIcon, Archive, 
  Plus, Check, ChevronLeft, Trash2, ShoppingCart, Coffee, Music, Video,
  Camera, Gamepad, Map, Mail, Calendar, Settings, Clock, Cloud,
  CircleDashed, CircleDot, CheckCircle2
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Briefcase, User, Heart, Lightbulb, DollarSign, Home: HomeIcon, 
  Plane, Book, Dumbbell, Users, Folder: FolderIcon, Archive,
  ShoppingCart, Coffee, Music, Video, Camera, Gamepad, Map, Mail,
  Calendar, Settings, Clock, Cloud
};

type Phase = {
  id: string;
  title: string;
  completed: boolean;
};

type Todo = { 
  id: string; 
  text: string; 
  done: boolean; 
  description: string;
  phases: Phase[];
};

type Folder = { 
  id: number; 
  name: string; 
  icon: string; 
  dotColor: string; 
  x: number; 
  y: number; 
  todos: Todo[]; 
};

const generatePhases = (count: number): Phase[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `phase-${i}`,
    title: `Phase ${i + 1}`,
    completed: false
  }));
};

const initialFolders: Folder[] = [
  { id: 1, name: 'Work', icon: 'Briefcase', dotColor: '#ef4444', x: 7, y: 3, todos: [{ id: '1', text: 'Finish Q3 Report', done: false, description: 'Compile all financial data for Q3 and create presentation.', phases: [{id: 'p1', title: 'Gather data', completed: true}, {id: 'p2', title: 'Draft slides', completed: false}, {id: 'p3', title: 'Review with team', completed: false}] }, { id: '2', text: 'Email client', done: true, description: 'Send the updated contract to the new client.', phases: [] }] },
  { id: 2, name: 'Personal', icon: 'User', dotColor: '#3b82f6', x: 8, y: 3, todos: [{ id: '3', text: 'Buy groceries', done: false, description: 'Milk, eggs, bread, and vegetables.', phases: [] }] },
  { id: 3, name: 'Health', icon: 'Heart', dotColor: '#10b981', x: 6, y: 3, todos: [] },
  { id: 4, name: 'Ideas', icon: 'Lightbulb', dotColor: '#f59e0b', x: 9, y: 3, todos: [{ id: '4', text: 'App idea', done: false, description: 'A new way to organize tasks.', phases: generatePhases(4) }] },
  { id: 5, name: 'Finance', icon: 'DollarSign', dotColor: '#8b5cf6', x: 7, y: 4, todos: [{ id: '7', text: 'Pay bills', done: false, description: 'Electricity and internet.', phases: [] }] },
  { id: 6, name: 'Home', icon: 'Home', dotColor: '#ec4899', x: 8, y: 4, todos: [] },
  { id: 7, name: 'Travel', icon: 'Plane', dotColor: '#06b6d4', x: 6, y: 4, todos: [] },
  { id: 8, name: 'Learning', icon: 'Book', dotColor: '#f97316', x: 9, y: 4, todos: [{ id: '8', text: 'Read chapter 1', done: false, description: 'Read the first chapter of the new design book.', phases: [] }] },
  { id: 9, name: 'Fitness', icon: 'Dumbbell', dotColor: '#14b8a6', x: 7, y: 5, todos: [] },
  { id: 10, name: 'Social', icon: 'Users', dotColor: '#6366f1', x: 8, y: 5, todos: [] },
  { id: 11, name: 'Projects', icon: 'Folder', dotColor: '#84cc16', x: 6, y: 5, todos: [] },
  { id: 12, name: 'Misc', icon: 'Archive', dotColor: '#64748b', x: 9, y: 5, todos: [] },
  { id: 13, name: 'Shopping', icon: 'ShoppingCart', dotColor: '#f43f5e', x: 7, y: 2, todos: [] },
  { id: 14, name: 'Leisure', icon: 'Coffee', dotColor: '#d946ef', x: 8, y: 2, todos: [] },
  { id: 15, name: 'Music', icon: 'Music', dotColor: '#10b981', x: 6, y: 2, todos: [] },
  { id: 16, name: 'Watchlist', icon: 'Video', dotColor: '#eab308', x: 9, y: 2, todos: [] },
  { id: 17, name: 'Photos', icon: 'Camera', dotColor: '#3b82f6', x: 5, y: 3, todos: [] },
  { id: 18, name: 'Games', icon: 'Gamepad', dotColor: '#ef4444', x: 10, y: 3, todos: [] },
  { id: 19, name: 'Maps', icon: 'Map', dotColor: '#10b981', x: 5, y: 4, todos: [] },
  { id: 20, name: 'Mail', icon: 'Mail', dotColor: '#f59e0b', x: 10, y: 4, todos: [] },
  { id: 21, name: 'Calendar', icon: 'Calendar', dotColor: '#ec4899', x: 5, y: 5, todos: [] },
  { id: 22, name: 'Settings', icon: 'Settings', dotColor: '#64748b', x: 10, y: 5, todos: [] },
];

const CELL_SIZE = 100;
const GAP = 24;
const TOTAL_CELL = CELL_SIZE + GAP;
const GRID_COLS = 16;
const GRID_ROWS = 9;
const CONTAINER_WIDTH = GRID_COLS * TOTAL_CELL;
const CONTAINER_HEIGHT = GRID_ROWS * TOTAL_CELL;

export default function App() {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const centerPosX = (GRID_COLS / 2) * TOTAL_CELL;
      const centerPosY = (GRID_ROWS / 2) * TOTAL_CELL;
      containerRef.current.scrollLeft = centerPosX - window.innerWidth / 2;
      containerRef.current.scrollTop = centerPosY - window.innerHeight / 2;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const updateTransforms = () => {
      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;
      const viewWidth = container.clientWidth;
      const viewHeight = container.clientHeight;
      const viewCenterX = scrollLeft + viewWidth / 2;
      const viewCenterY = scrollTop + viewHeight / 2;
      
      const maxDist = Math.max(viewWidth, viewHeight) * 0.6;
      const fullSizeRadius = TOTAL_CELL * 1.2; // roughly 2x2 area in the center

      folders.forEach(folder => {
        const el = document.getElementById(`folder-${folder.id}`);
        if (!el) return;

        const elCenterX = (folder.x * TOTAL_CELL) + (CELL_SIZE / 2);
        const elCenterY = (folder.y * TOTAL_CELL) + (CELL_SIZE / 2);

        const dist = Math.sqrt(Math.pow(elCenterX - viewCenterX, 2) + Math.pow(elCenterY - viewCenterY, 2));
        
        let scale = 1;
        if (dist > fullSizeRadius) {
          const extraDist = dist - fullSizeRadius;
          scale = Math.max(0.4, 1 - (extraDist / maxDist));
        }

        el.style.transform = `scale(${scale})`;
        el.style.opacity = `${Math.max(0.2, scale)}`;
      });
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateTransforms();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    updateTransforms();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [folders]);

  const [isPanning, setIsPanning] = useState(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.folder-item')) return;
    setIsPanning(true);
    lastPan.current = { x: e.clientX, y: e.clientY };
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning || !containerRef.current) return;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    containerRef.current.scrollLeft -= dx;
    containerRef.current.scrollTop -= dy;
    lastPan.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  const handleDragEnd = (folderId: number, info: PanInfo) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const deltaX = Math.round(info.offset.x / TOTAL_CELL);
    const deltaY = Math.round(info.offset.y / TOTAL_CELL);

    if (deltaX === 0 && deltaY === 0) return;

    let newX = folder.x + deltaX;
    let newY = folder.y + deltaY;

    newX = Math.max(0, Math.min(GRID_COLS - 1, newX));
    newY = Math.max(0, Math.min(GRID_ROWS - 1, newY));

    const occupied = folders.some(f => f.id !== folderId && f.x === newX && f.y === newY);
    if (occupied) {
      setFolders(prev => prev.map(f => {
        if (f.id === folderId) return { ...f, x: newX, y: newY };
        if (f.x === newX && f.y === newY) return { ...f, x: folder.x, y: folder.y };
        return f;
      }));
    } else {
      setFolders(prev => prev.map(f => {
        if (f.id === folderId) return { ...f, x: newX, y: newY };
        return f;
      }));
    }
  };

  const updateFolder = (folderId: number, updater: (f: Folder) => Folder) => {
    setFolders(prev => prev.map(f => f.id === folderId ? updater(f) : f));
  };

  // Generate empty grid slots
  const emptySlots = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      emptySlots.push(
        <div 
          key={`slot-${x}-${y}`}
          className="absolute border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center pointer-events-none"
          style={{
            left: x * TOTAL_CELL,
            top: y * TOTAL_CELL,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        >
          <Plus size={24} className="text-white/10" />
        </div>
      );
    }
  }

  return (
    <div className="w-full h-screen bg-[#101015] text-[#F1F0E1] font-mono selection:bg-[#506385] selection:text-white overflow-hidden flex flex-col relative">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-end z-20 pointer-events-none">
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase leading-none text-white drop-shadow-md">GridDo</h1>
          <p className="text-[#506385] text-sm mt-2 uppercase tracking-wider font-bold">FHD Workspace</p>
        </div>
        <div className="text-[#F1F0E1] text-sm font-bold bg-[#1a1a1f]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg pointer-events-auto">
          {folders.reduce((acc, f) => acc + f.todos.filter(t => !t.done).length, 0)} Tasks
        </div>
      </header>

      <div 
        ref={containerRef}
        className={`w-full h-full overflow-auto no-scrollbar ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT, position: 'relative', margin: '100px' }}>
          {emptySlots}
          {folders.map(folder => (
            <DraggableFolder 
              key={folder.id}
              folder={folder} 
              onDragEnd={handleDragEnd} 
              onClick={() => { if (!isPanning) setSelectedFolderId(folder.id); }} 
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedFolder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={() => setSelectedFolderId(null)} />
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-6xl bg-[#101015] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col h-[85vh] pointer-events-auto relative z-10"
            >
              <FolderView 
                folder={selectedFolder} 
                onClose={() => setSelectedFolderId(null)} 
                updateFolder={(updater) => updateFolder(selectedFolder.id, updater)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DraggableFolder({ folder, onDragEnd, onClick }: { folder: Folder, onDragEnd: (id: number, info: PanInfo) => void, onClick: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const Icon = iconMap[folder.icon];
  const pendingCount = folder.todos.filter(t => !t.done).length;

  return (
    <motion.div
      className="folder-item absolute"
      style={{
        left: folder.x * TOTAL_CELL,
        top: folder.y * TOTAL_CELL,
        width: CELL_SIZE,
        height: CELL_SIZE,
        x, y,
      }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ zIndex: 50, scale: 1.1 }}
      whileHover={{ scale: 1.05, zIndex: 40 }}
      onDragEnd={(e, info) => {
        onDragEnd(folder.id, info);
        x.set(0);
        y.set(0);
      }}
      onClick={onClick}
    >
      <div 
        id={`folder-${folder.id}`} 
        className="w-full h-full bg-[#1a1a1f] rounded-3xl p-3 flex flex-col cursor-pointer hover:bg-[#222228] transition-colors border border-white/5 group shadow-lg origin-center"
      >
        {pendingCount > 0 && (
          <div 
            className="absolute -top-2 -right-2 flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded-full text-[11px] font-bold text-[#101015] z-10 shadow-md border-2 border-[#101015]" 
            style={{ backgroundColor: folder.dotColor }}
          >
            {pendingCount}
          </div>
        )}
        
        <div className="flex-grow flex items-center justify-center">
          {Icon && <Icon size={36} className="text-[#F1F0E1] opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: folder.dotColor }} />}
        </div>

        <div className="text-center text-xs font-bold text-[#506385] mt-1 truncate">
          {folder.name}
        </div>
      </div>
    </motion.div>
  );
}

function FolderView({ folder, onClose, updateFolder }: { folder: Folder; onClose: () => void; updateFolder: (updater: (f: Folder) => Folder) => void; }) {
  const [newTask, setNewTask] = useState('');
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(folder.todos[0]?.id || null);
  const Icon = iconMap[folder.icon];

  const selectedTodo = folder.todos.find(t => t.id === selectedTodoId);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newTodo: Todo = {
        id: Math.random().toString(36).substring(2, 9),
        text: newTask.trim(),
        done: false,
        description: '',
        phases: []
      };
      updateFolder(f => ({ ...f, todos: [...f.todos, newTodo] }));
      setNewTask('');
      setSelectedTodoId(newTodo.id);
    }
  };

  const toggleTodo = (id: string) => {
    updateFolder(f => ({ ...f, todos: f.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  };

  const deleteTodo = (id: string) => {
    updateFolder(f => ({ ...f, todos: f.todos.filter(t => t.id !== id) }));
    if (selectedTodoId === id) setSelectedTodoId(null);
  };

  const updateTodoDetails = (id: string, updates: Partial<Todo>) => {
    updateFolder(f => ({ ...f, todos: f.todos.map(t => t.id === id ? { ...t, ...updates } : t) }));
  };

  const togglePhase = (todoId: string, phaseId: string) => {
    updateFolder(f => ({
      ...f,
      todos: f.todos.map(t => {
        if (t.id !== todoId) return t;
        return {
          ...t,
          phases: t.phases.map(p => p.id === phaseId ? { ...p, completed: !p.completed } : p)
        };
      })
    }));
  };

  const addPhase = (todoId: string) => {
    updateFolder(f => ({
      ...f,
      todos: f.todos.map(t => {
        if (t.id !== todoId) return t;
        return {
          ...t,
          phases: [...t.phases, { id: Math.random().toString(36).substring(2, 9), title: 'New Phase', completed: false }]
        };
      })
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-[#1a1a1f] shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-[#222228] rounded-full transition-colors text-[#506385] hover:text-[#F1F0E1]">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${folder.dotColor}20`, color: folder.dotColor }}>
            {Icon && <Icon size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide uppercase text-white">{folder.name}</h2>
            <p className="text-xs text-[#506385] font-bold mt-0.5">{folder.todos.length} Tasks</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Column: Task List */}
        <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#101015]">
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {folder.todos.length === 0 ? (
              <div className="text-center text-[#506385] mt-10 text-sm flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1f] flex items-center justify-center">
                  <Check size={24} className="opacity-50" />
                </div>
                <p>All caught up!</p>
              </div>
            ) : (
              folder.todos.map(todo => (
                <motion.div 
                  key={todo.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  onClick={() => setSelectedTodoId(todo.id)}
                  className={`flex items-center gap-3 group p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedTodoId === todo.id 
                      ? 'bg-[#222228] border-white/10 shadow-md' 
                      : 'bg-[#1a1a1f] border-white/5 hover:border-white/10 shadow-sm'
                  }`}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id); }} 
                    className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors shrink-0 ${
                      todo.done ? 'bg-[#506385] border-[#506385] text-[#101015]' : 'border-[#506385] hover:border-[#F1F0E1]'
                    }`}
                  >
                    {todo.done && <Check size={16} strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate transition-colors ${todo.done ? 'text-[#506385] line-through' : 'text-[#F1F0E1]'}`}>
                      {todo.text}
                    </p>
                    {todo.phases.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {todo.phases.map((p, i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full ${p.completed ? 'bg-[#506385]' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} 
                    className="opacity-0 group-hover:opacity-100 p-2 text-[#506385] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-white/5 bg-[#1a1a1f] shrink-0">
            <form onSubmit={handleAdd} className="relative">
              <input 
                type="text" 
                value={newTask} 
                onChange={(e) => setNewTask(e.target.value)} 
                placeholder="Add a new task..." 
                className="w-full bg-[#101015] border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-[#506385] transition-colors placeholder:text-[#506385] text-white shadow-inner" 
              />
              <button type="submit" disabled={!newTask.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#506385] text-[#101015] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#F1F0E1] hover:scale-105 active:scale-95">
                <Plus size={20} strokeWidth={3} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Task Details */}
        <div className="flex-1 bg-[#15151a] overflow-y-auto">
          {selectedTodo ? (
            <div className="p-8 max-w-2xl mx-auto">
              <div className="mb-8">
                <input
                  type="text"
                  value={selectedTodo.text}
                  onChange={(e) => updateTodoDetails(selectedTodo.id, { text: e.target.value })}
                  className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none border-b border-transparent focus:border-white/10 pb-2 transition-colors"
                  placeholder="Task title"
                />
              </div>

              <div className="space-y-8">
                {/* Description Section */}
                <section>
                  <h3 className="text-sm font-bold text-[#506385] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Archive size={16} /> Description
                  </h3>
                  <textarea
                    value={selectedTodo.description || ''}
                    onChange={(e) => updateTodoDetails(selectedTodo.id, { description: e.target.value })}
                    placeholder="Add a more detailed description..."
                    className="w-full bg-[#1a1a1f] border border-white/5 rounded-2xl p-4 text-sm text-[#F1F0E1] focus:outline-none focus:border-[#506385] transition-colors min-h-[120px] resize-y"
                  />
                </section>

                {/* Phases / Timeline Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#506385] uppercase tracking-wider flex items-center gap-2">
                      <Clock size={16} /> Phases & Timeline
                    </h3>
                    <button 
                      onClick={() => addPhase(selectedTodo.id)}
                      className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Phase
                    </button>
                  </div>

                  <div className="bg-[#1a1a1f] border border-white/5 rounded-2xl p-2">
                    {selectedTodo.phases.length === 0 ? (
                      <div className="p-6 text-center text-[#506385] text-sm">
                        No phases added yet. Break down your task into smaller steps.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {selectedTodo.phases.map((phase, index) => (
                          <div key={phase.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                            <button 
                              onClick={() => togglePhase(selectedTodo.id, phase.id)}
                              className="text-[#506385] hover:text-[#F1F0E1] transition-colors"
                            >
                              {phase.completed ? <CheckCircle2 size={20} className="text-[#10b981]" /> : <CircleDashed size={20} />}
                            </button>
                            <input
                              type="text"
                              value={phase.title}
                              onChange={(e) => {
                                const newPhases = [...selectedTodo.phases];
                                newPhases[index].title = e.target.value;
                                updateTodoDetails(selectedTodo.id, { phases: newPhases });
                              }}
                              className={`flex-1 bg-transparent focus:outline-none text-sm transition-colors ${phase.completed ? 'text-[#506385] line-through' : 'text-[#F1F0E1]'}`}
                            />
                            <button 
                              onClick={() => {
                                const newPhases = selectedTodo.phases.filter(p => p.id !== phase.id);
                                updateTodoDetails(selectedTodo.id, { phases: newPhases });
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-[#506385] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#506385]">
              <FolderIcon size={48} className="opacity-20 mb-4" />
              <p>Select a task to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
