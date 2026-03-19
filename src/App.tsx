import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'motion/react';
import { 
  Briefcase, User, Heart, Lightbulb, DollarSign, HomeIcon, 
  Plane, Book, Dumbbell, Users, Folder as FolderIcon, Archive, 
  Plus, Check, ChevronLeft, Trash2, ShoppingCart, Coffee, Music, Video,
  Camera, Gamepad, Map, Mail, Calendar, Settings, Clock, Cloud,
  CircleDashed, CircleDot, CheckCircle2, Edit2, Sun, Moon, ChevronDown, ChevronUp,
  Search, Flag, AlertCircle, ChevronRight
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Briefcase, User, Heart, Lightbulb, DollarSign, Home: HomeIcon, 
  Plane, Book, Dumbbell, Users, Folder: FolderIcon, Archive,
  ShoppingCart, Coffee, Music, Video, Camera, Gamepad, Map, Mail,
  Calendar, Settings, Clock, Cloud
};

const availableIcons = Object.keys(iconMap);
const availableColors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#64748b'];

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
  flagged?: boolean;
  deadline?: string;
};

type Folder = { 
  id: number; 
  parentId: number | null;
  name: string; 
  description?: string;
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
  { id: 1, parentId: null, name: 'Work', icon: 'Briefcase', dotColor: '#ef4444', x: 7, y: 3, todos: [{ id: '1', text: 'Finish Q3 Report', done: false, description: 'Compile all financial data for Q3 and create presentation.', phases: [{id: 'p1', title: 'Gather data', completed: true}, {id: 'p2', title: 'Draft slides', completed: false}, {id: 'p3', title: 'Review with team', completed: false}], deadline: '2026-03-20' }, { id: '2', text: 'Email client', done: true, description: 'Send the updated contract to the new client.', phases: [] }] },
  { id: 2, parentId: null, name: 'Personal', icon: 'User', dotColor: '#3b82f6', x: 8, y: 3, todos: [{ id: '3', text: 'Buy groceries', done: false, description: 'Milk, eggs, bread, and vegetables.', phases: [], flagged: true }] },
  { id: 3, parentId: null, name: 'Health', icon: 'Heart', dotColor: '#10b981', x: 6, y: 3, todos: [] },
  { id: 4, parentId: null, name: 'Ideas', icon: 'Lightbulb', dotColor: '#f59e0b', x: 9, y: 3, todos: [{ id: '4', text: 'App idea', done: false, description: 'A new way to organize tasks.', phases: generatePhases(4) }] },
  { id: 5, parentId: null, name: 'Finance', icon: 'DollarSign', dotColor: '#8b5cf6', x: 7, y: 4, todos: [{ id: '7', text: 'Pay bills', done: false, description: 'Electricity and internet.', phases: [] }] },
  { id: 6, parentId: null, name: 'Home', icon: 'Home', dotColor: '#ec4899', x: 8, y: 4, todos: [] },
  { id: 7, parentId: null, name: 'Travel', icon: 'Plane', dotColor: '#06b6d4', x: 6, y: 4, todos: [] },
  { id: 8, parentId: null, name: 'Learning', icon: 'Book', dotColor: '#f97316', x: 9, y: 4, todos: [{ id: '8', text: 'Read chapter 1', done: false, description: 'Read the first chapter of the new design book.', phases: [] }] },
  { id: 9, parentId: null, name: 'Fitness', icon: 'Dumbbell', dotColor: '#14b8a6', x: 7, y: 5, todos: [] },
  { id: 10, parentId: null, name: 'Social', icon: 'Users', dotColor: '#6366f1', x: 8, y: 5, todos: [] },
  { id: 11, parentId: null, name: 'Projects', icon: 'Folder', dotColor: '#84cc16', x: 6, y: 5, todos: [] },
  { id: 12, parentId: null, name: 'Misc', icon: 'Archive', dotColor: '#64748b', x: 9, y: 5, todos: [] },
  { id: 13, parentId: null, name: 'Shopping', icon: 'ShoppingCart', dotColor: '#f43f5e', x: 7, y: 2, todos: [] },
  { id: 14, parentId: null, name: 'Leisure', icon: 'Coffee', dotColor: '#d946ef', x: 8, y: 2, todos: [] },
  { id: 15, parentId: null, name: 'Music', icon: 'Music', dotColor: '#10b981', x: 6, y: 2, todos: [] },
  { id: 16, parentId: null, name: 'Watchlist', icon: 'Video', dotColor: '#eab308', x: 9, y: 2, todos: [] },
  { id: 17, parentId: null, name: 'Photos', icon: 'Camera', dotColor: '#3b82f6', x: 5, y: 3, todos: [] },
  { id: 18, parentId: null, name: 'Games', icon: 'Gamepad', dotColor: '#ef4444', x: 10, y: 3, todos: [] },
  { id: 19, parentId: null, name: 'Maps', icon: 'Map', dotColor: '#10b981', x: 5, y: 4, todos: [] },
  { id: 20, parentId: null, name: 'Mail', icon: 'Mail', dotColor: '#f59e0b', x: 10, y: 4, todos: [] },
  { id: 21, parentId: null, name: 'Calendar', icon: 'Calendar', dotColor: '#ec4899', x: 5, y: 5, todos: [] },
  { id: 22, parentId: null, name: 'Settings', icon: 'Settings', dotColor: '#64748b', x: 10, y: 5, todos: [] },
  
  // Subfolders for demonstration
  { id: 101, parentId: 1, name: 'Q3 Project', icon: 'Folder', dotColor: '#ef4444', x: 7, y: 4, todos: [] },
  { id: 102, parentId: 1, name: 'Invoices', icon: 'Archive', dotColor: '#ef4444', x: 8, y: 4, todos: [] },
];

const CELL_SIZE = 100;
const GAP = 24;
const TOTAL_CELL = CELL_SIZE + GAP;
const GRID_COLS = 16;
const GRID_ROWS = 9;
const CONTAINER_WIDTH = GRID_COLS * TOTAL_CELL;
const CONTAINER_HEIGHT = GRID_ROWS * TOTAL_CELL;

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  
  const dragTargetRef = useRef<HTMLDivElement>(null);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDraggingFolder, setIsDraggingFolder] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const visibleFolders = folders.filter(f => f.parentId === currentParentId);
  const currentFolder = folders.find(f => f.id === currentParentId);

  const breadcrumbs = useMemo(() => {
    const path: Folder[] = [];
    let curr = currentFolder;
    while (curr) {
      path.unshift(curr);
      curr = folders.find(f => f.id === curr?.parentId);
    }
    return path;
  }, [currentFolder, folders]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const centerPosX = (GRID_COLS / 2) * TOTAL_CELL;
      const centerPosY = (GRID_ROWS / 2) * TOTAL_CELL;
      containerRef.current.scrollLeft = centerPosX - containerRef.current.clientWidth / 2;
      containerRef.current.scrollTop = centerPosY - containerRef.current.clientHeight / 2;
    }
  }, [currentParentId]);

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

      visibleFolders.forEach(folder => {
        const el = document.getElementById(`folder-${folder.id}`);
        if (!el) return;

        const elCenterX = (folder.x * TOTAL_CELL) + (CELL_SIZE / 2);
        const elCenterY = (folder.y * TOTAL_CELL) + (CELL_SIZE / 2);

        const cellDistX = Math.abs(elCenterX - viewCenterX) / TOTAL_CELL;
        const cellDistY = Math.abs(elCenterY - viewCenterY) / TOTAL_CELL;
        const cellDist = Math.max(cellDistX, cellDistY);

        let scale = 1;

        if (cellDist <= 1.5) {
          scale = 1.0;
        } else if (cellDist <= 2.5) {
          const t = cellDist - 1.5;
          scale = 1.0 - (0.4 * t);
        } else if (cellDist <= 3.5) {
          const t = cellDist - 2.5;
          scale = 0.6 - (0.3 * t);
        } else {
          const t = Math.min(1, cellDist - 3.5);
          scale = 0.3 - (0.3 * t);
        }

        if (scale < 0) scale = 0;

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
    
    setTimeout(updateTransforms, 50);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [visibleFolders, currentParentId]);

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

  const handleDragStart = (folderId: number) => {
    setIsDraggingFolder(true);
    const folder = folders.find(f => f.id === folderId);
    if (dragTargetRef.current && folder) {
      dragTargetRef.current.style.display = 'flex';
      dragTargetRef.current.style.left = `${folder.x * TOTAL_CELL}px`;
      dragTargetRef.current.style.top = `${folder.y * TOTAL_CELL}px`;
    }
  };

  const handleDragUpdate = (x: number, y: number) => {
    if (dragTargetRef.current) {
      dragTargetRef.current.style.left = `${x * TOTAL_CELL}px`;
      dragTargetRef.current.style.top = `${y * TOTAL_CELL}px`;
    }
  };

  const handleDragEnd = (folderId: number, info: PanInfo) => {
    setIsDraggingFolder(false);
    if (dragTargetRef.current) {
      dragTargetRef.current.style.display = 'none';
    }
    
    // Check if dropped on edit button
    if (editBtnRef.current) {
      const rect = editBtnRef.current.getBoundingClientRect();
      if (
        info.point.x >= rect.left && info.point.x <= rect.right &&
        info.point.y >= rect.top && info.point.y <= rect.bottom
      ) {
        setEditingFolderId(folderId);
        setIsFolderModalOpen(true);
        return; // Do not move the folder
      }
    }

    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const deltaX = Math.round(info.offset.x / TOTAL_CELL);
    const deltaY = Math.round(info.offset.y / TOTAL_CELL);

    if (deltaX === 0 && deltaY === 0) return;

    let newX = folder.x + deltaX;
    let newY = folder.y + deltaY;

    newX = Math.max(0, Math.min(GRID_COLS - 1, newX));
    newY = Math.max(0, Math.min(GRID_ROWS - 1, newY));

    const occupied = visibleFolders.some(f => f.id !== folderId && f.x === newX && f.y === newY);
    if (occupied) {
      setFolders(prev => prev.map(f => {
        if (f.id === folderId) return { ...f, x: newX, y: newY };
        if (f.parentId === currentParentId && f.x === newX && f.y === newY) return { ...f, x: folder.x, y: folder.y };
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

  const handleFolderClick = (folderId: number) => {
    if (!isPanning) {
      if (isEditMode) {
        setEditingFolderId(folderId);
        setIsFolderModalOpen(true);
      } else {
        setCurrentParentId(folderId);
      }
    }
  };

  const handleGoBack = () => {
    if (currentFolder) {
      setCurrentParentId(currentFolder.parentId);
    }
  };

  const hasImportantTodos = (folderId: number): boolean => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return false;
    
    if (folder.todos.some(t => !t.done && (t.flagged || t.deadline))) return true;
    
    const children = folders.filter(f => f.parentId === folderId);
    return children.some(c => hasImportantTodos(c.id));
  };

  const emptySlots = [];
  if (isEditMode) {
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const isOccupied = visibleFolders.some(f => f.x === x && f.y === y);
        if (!isOccupied) {
          emptySlots.push(
            <div 
              key={`slot-${x}-${y}`}
              className="absolute border-2 border-dashed border-[var(--border-color-strong)] rounded-3xl flex items-center justify-center pointer-events-none z-0"
              style={{
                left: x * TOTAL_CELL,
                top: y * TOTAL_CELL,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            >
              <Plus size={24} className="text-[var(--border-color-strong)] opacity-50" />
            </div>
          );
        }
      }
    }
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return folders.filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.description?.toLowerCase().includes(query) ||
      f.todos.some(t => t.text.toLowerCase().includes(query))
    );
  }, [searchQuery, folders]);

  return (
    <div className="w-full h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent-muted)] selection:text-[var(--bg-main)] overflow-hidden flex transition-colors duration-300">
      
      {/* Vertical Toolbar (Left) */}
      <div className="w-20 border-r border-[var(--border-color)] bg-[var(--bg-panel)] flex flex-col items-center py-6 gap-6 z-40 shadow-xl shrink-0">
        <button 
          onClick={() => { setEditingFolderId(null); setIsFolderModalOpen(true); }}
          className="w-12 h-12 bg-[var(--accent-muted)] text-[var(--bg-main)] rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
          title="New Folder"
        >
          <Plus size={28} strokeWidth={3} />
        </button>

        <div className="w-10 h-px bg-[var(--border-color)]" />

        <motion.button 
          ref={editBtnRef}
          onClick={() => setIsEditMode(!isEditMode)}
          animate={isDraggingFolder ? { scale: 1.2, boxShadow: "0 0 20px var(--accent-muted)" } : { scale: 1, boxShadow: "none" }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isEditMode ? 'bg-[var(--accent-muted)] text-[var(--bg-main)]' : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)]'}`}
          title="Edit Mode (or drag folder here)"
        >
          <Edit2 size={22} />
        </motion.button>

        <button 
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          className="w-12 h-12 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)] transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-12 h-12 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)] transition-colors"
          title="Search"
        >
          <Search size={22} />
        </button>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Header / Breadcrumbs */}
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
          
          <div className="flex items-center gap-3 pointer-events-auto bg-[var(--bg-panel)]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <button 
              onClick={() => setCurrentParentId(null)}
              className="text-[var(--accent-muted)] hover:text-[var(--text-main)] transition-colors font-bold flex items-center gap-1"
            >
              <HomeIcon size={18} /> Home
            </button>
            
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight size={16} className="text-[var(--border-color-strong)]" />
                <button 
                  onClick={() => setCurrentParentId(crumb.id)}
                  className={`font-bold transition-colors ${idx === breadcrumbs.length - 1 ? 'text-[var(--text-main)]' : 'text-[var(--accent-muted)] hover:text-[var(--text-main)]'}`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-4 pointer-events-auto">
            <AnimatePresence>
              {isEditMode && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-red-500 font-bold text-sm flex items-center gap-2 bg-red-500/10 px-4 py-2.5 rounded-2xl border border-red-500/20 shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Editing Layout
                </motion.div>
              )}
            </AnimatePresence>
            
            {currentParentId !== null && (
              <button
                onClick={handleGoBack}
                className="px-4 py-2.5 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl shadow-sm text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)] transition-all flex items-center gap-2 font-bold"
              >
                <ChevronLeft size={18} /> Back
              </button>
            )}
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
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentParentId || 'root'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT, position: 'relative', margin: '100px' }}
            >
              
              {/* Empty Slots (Edit Mode) */}
              {emptySlots}

              {/* Nearest Placement Spot */}
              <div 
                ref={dragTargetRef}
                className="absolute border-2 border-dashed border-[var(--accent-muted)] rounded-3xl flex items-center justify-center pointer-events-none z-0"
                style={{
                  display: 'none',
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              >
                <Plus size={24} className="text-[var(--accent-muted)] opacity-50" />
              </div>

              {visibleFolders.map(folder => (
                <DraggableFolder 
                  key={folder.id}
                  folder={folder} 
                  hasImportantTodos={hasImportantTodos(folder.id)}
                  onDragStart={() => handleDragStart(folder.id)}
                  onDragUpdate={handleDragUpdate}
                  onDragEnd={handleDragEnd} 
                  onClick={() => handleFolderClick(folder.id)} 
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar for Todos */}
      <AnimatePresence>
        {currentParentId !== null && currentFolder && (
          <motion.div 
            initial={{ width: 0, opacity: 0, x: 50 }}
            animate={{ width: '450px', opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-l border-[var(--border-color)] bg-[var(--bg-panel)] flex flex-col z-30 shadow-2xl h-full shrink-0"
          >
            <div className="w-[450px] h-full flex flex-col">
              <TodoSidebar 
                folder={currentFolder} 
                updateFolder={(updater) => updateFolder(currentFolder.id, updater)} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder Modal (New / Edit) */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <FolderModal
            isOpen={isFolderModalOpen}
            onClose={() => setIsFolderModalOpen(false)}
            editingFolderId={editingFolderId}
            folders={folders}
            setFolders={setFolders}
            currentParentId={currentParentId}
          />
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            onSelect={(folderId) => {
              const folder = folders.find(f => f.id === folderId);
              if (folder) {
                setCurrentParentId(folder.parentId);
                setIsSearchOpen(false);
                setSearchQuery('');
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DraggableFolder({ folder, hasImportantTodos, onDragStart, onDragUpdate, onDragEnd, onClick }: { folder: Folder, hasImportantTodos: boolean, onDragStart: () => void, onDragUpdate: (x: number, y: number) => void, onDragEnd: (id: number, info: PanInfo) => void, onClick: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const Icon = iconMap[folder.icon] || FolderIcon;
  const pendingCount = folder.todos.filter(t => !t.done).length;
  
  const dragStartPos = useRef({x: 0, y: 0});

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
      onPointerDown={(e) => {
        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }}
      onDragStart={onDragStart}
      onDrag={(e, info) => {
        const deltaX = Math.round(info.offset.x / TOTAL_CELL);
        const deltaY = Math.round(info.offset.y / TOTAL_CELL);
        let newX = Math.max(0, Math.min(GRID_COLS - 1, folder.x + deltaX));
        let newY = Math.max(0, Math.min(GRID_ROWS - 1, folder.y + deltaY));
        onDragUpdate(newX, newY);
      }}
      onDragEnd={(e, info) => {
        onDragEnd(folder.id, info);
        x.set(0);
        y.set(0);
      }}
      onClick={(e) => {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          onClick();
        }
      }}
    >
      <div 
        id={`folder-${folder.id}`} 
        className="w-full h-full bg-[var(--bg-panel)] rounded-3xl p-3 flex flex-col cursor-pointer hover:bg-[var(--bg-panel-hover)] transition-colors border border-[var(--border-color)] group shadow-lg origin-center relative"
      >
        {hasImportantTodos && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md border-2 border-[var(--bg-panel)] z-10">
            <AlertCircle size={14} strokeWidth={3} />
          </div>
        )}
        
        {pendingCount > 0 && (
          <div 
            className="absolute -top-2 -right-2 flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded-full text-[11px] font-bold text-[#101015] z-10 shadow-md border-2 border-[var(--bg-panel)]" 
            style={{ backgroundColor: folder.dotColor }}
          >
            {pendingCount}
          </div>
        )}
        
        <div className="flex-grow flex items-center justify-center">
          <Icon size={36} className="text-[var(--text-main)] opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: folder.dotColor }} />
        </div>

        <div className="text-center text-xs font-bold text-[var(--accent-muted)] mt-1 truncate">
          {folder.name}
        </div>
      </div>
    </motion.div>
  );
}

function TodoSidebar({ folder, updateFolder }: { folder: Folder; updateFolder: (updater: (f: Folder) => Folder) => void; }) {
  const [newTask, setNewTask] = useState('');
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);

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
      setExpandedTodoId(newTodo.id);
    }
  };

  const toggleTodo = (id: string) => {
    updateFolder(f => ({ ...f, todos: f.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  };

  const deleteTodo = (id: string) => {
    updateFolder(f => ({ ...f, todos: f.todos.filter(t => t.id !== id) }));
    if (expandedTodoId === id) setExpandedTodoId(null);
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
    <>
      <div className="p-6 border-b border-[var(--border-color)] shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide text-[var(--text-main)]">Tasks</h2>
          <p className="text-xs text-[var(--accent-muted)] font-bold mt-1">
            {folder.todos.filter(t => !t.done).length} remaining
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {folder.todos.length === 0 ? (
          <div className="text-center text-[var(--accent-muted)] mt-10 text-sm flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-color)]">
              <Check size={24} className="opacity-50" />
            </div>
            <p>All caught up!</p>
          </div>
        ) : (
          folder.todos.map(todo => (
            <div 
              key={todo.id} 
              className={`bg-[var(--bg-main)] border rounded-2xl overflow-hidden transition-all ${
                expandedTodoId === todo.id 
                  ? 'border-[var(--border-color-strong)] shadow-md' 
                  : 'border-[var(--border-color)] shadow-sm'
              }`}
            >
              <div 
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-panel-hover)] transition-colors group"
                onClick={() => setExpandedTodoId(expandedTodoId === todo.id ? null : todo.id)}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id); }} 
                  className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors shrink-0 ${
                    todo.done ? 'bg-[var(--accent-muted)] border-[var(--accent-muted)] text-[var(--bg-main)]' : 'border-[var(--accent-muted)] hover:border-[var(--text-main)]'
                  }`}
                >
                  {todo.done && <Check size={16} strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className={`text-sm font-medium truncate transition-colors ${todo.done ? 'text-[var(--accent-muted)] line-through' : 'text-[var(--text-main)]'}`}>
                    {todo.text}
                  </p>
                  {todo.flagged && <Flag size={14} className="text-red-500 shrink-0" />}
                  {todo.deadline && <Clock size={14} className="text-orange-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} 
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--accent-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="text-[var(--accent-muted)]">
                    {expandedTodoId === todo.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedTodoId === todo.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[var(--border-color)] bg-[var(--bg-panel)]"
                  >
                    <div className="p-4 space-y-4">
                      {/* Meta */}
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-[var(--text-main)] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={todo.flagged || false}
                            onChange={(e) => updateTodoDetails(todo.id, { flagged: e.target.checked })}
                            className="rounded border-[var(--border-color)] text-[var(--accent-muted)] focus:ring-[var(--accent-muted)]"
                          />
                          <Flag size={14} className={todo.flagged ? 'text-red-500' : 'text-[var(--accent-muted)]'} />
                          Flagged
                        </label>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-main)]">
                          <Clock size={14} className={todo.deadline ? 'text-orange-500' : 'text-[var(--accent-muted)]'} />
                          <input 
                            type="date" 
                            value={todo.deadline || ''}
                            onChange={(e) => updateTodoDetails(todo.id, { deadline: e.target.value })}
                            className="bg-transparent border-b border-[var(--border-color)] focus:border-[var(--accent-muted)] focus:outline-none text-[var(--text-main)]"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <textarea
                          value={todo.description || ''}
                          onChange={(e) => updateTodoDetails(todo.id, { description: e.target.value })}
                          placeholder="Add description..."
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-muted)] transition-colors min-h-[80px] resize-y"
                        />
                      </div>

                      {/* Phases */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-[var(--accent-muted)] uppercase tracking-wider">Phases</h4>
                          <button 
                            onClick={() => addPhase(todo.id)}
                            className="text-xs text-[var(--text-main)] hover:bg-[var(--bg-main)] px-2 py-1 rounded transition-colors flex items-center gap-1"
                          >
                            <Plus size={12} /> Add
                          </button>
                        </div>
                        <div className="space-y-1">
                          {todo.phases.map((phase, index) => (
                            <div key={phase.id} className="flex items-center gap-2 group">
                              <button 
                                onClick={() => togglePhase(todo.id, phase.id)}
                                className="text-[var(--accent-muted)] hover:text-[var(--text-main)] transition-colors"
                              >
                                {phase.completed ? <CheckCircle2 size={16} className="text-[#10b981]" /> : <CircleDashed size={16} />}
                              </button>
                              <input
                                type="text"
                                value={phase.title}
                                onChange={(e) => {
                                  const newPhases = [...todo.phases];
                                  newPhases[index].title = e.target.value;
                                  updateTodoDetails(todo.id, { phases: newPhases });
                                }}
                                className={`flex-1 bg-transparent focus:outline-none text-sm transition-colors ${phase.completed ? 'text-[var(--accent-muted)] line-through' : 'text-[var(--text-main)]'}`}
                              />
                              <button 
                                onClick={() => {
                                  const newPhases = todo.phases.filter(p => p.id !== phase.id);
                                  updateTodoDetails(todo.id, { phases: newPhases });
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-[var(--accent-muted)] hover:text-red-400 rounded transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-[var(--border-color)] shrink-0 bg-[var(--bg-main)]">
        <form onSubmit={handleAdd} className="relative">
          <input 
            type="text" 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)} 
            placeholder="Add a new task..." 
            className="w-full bg-[var(--bg-panel)] border border-[var(--border-color-strong)] rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-[var(--accent-muted)] transition-colors placeholder:text-[var(--accent-muted)] text-[var(--text-main)] shadow-sm" 
          />
          <button type="submit" disabled={!newTask.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--accent-muted)] text-[var(--bg-main)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-80 hover:scale-105 active:scale-95">
            <Plus size={20} strokeWidth={3} />
          </button>
        </form>
      </div>
    </>
  );
}

function FolderModal({ 
  isOpen, 
  onClose, 
  editingFolderId, 
  folders, 
  setFolders, 
  currentParentId 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  editingFolderId: number | null, 
  folders: Folder[], 
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  currentParentId: number | null
}) {
  const editingFolder = editingFolderId ? folders.find(f => f.id === editingFolderId) : null;
  
  const [title, setTitle] = useState(editingFolder?.name || '');
  const [desc, setDesc] = useState(editingFolder?.description || '');
  const [icon, setIcon] = useState(editingFolder?.icon || 'Folder');
  const [color, setColor] = useState(editingFolder?.dotColor || availableColors[0]);

  const handleSave = () => {
    if (!title.trim()) return;

    if (editingFolderId) {
      setFolders(prev => prev.map(f => f.id === editingFolderId ? {
        ...f,
        name: title.trim(),
        description: desc.trim(),
        icon,
        dotColor: color
      } : f));
    } else {
      let spawnX = Math.floor(GRID_COLS / 2);
      let spawnY = Math.floor(GRID_ROWS / 2);
      
      const visibleFolders = folders.filter(f => f.parentId === currentParentId);
      let found = false;
      for (let r = 0; r < Math.max(GRID_COLS, GRID_ROWS); r++) {
        for (let dx = -r; dx <= r; dx++) {
          for (let dy = -r; dy <= r; dy++) {
            const cx = spawnX + dx;
            const cy = spawnY + dy;
            if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
              if (!visibleFolders.some(f => f.x === cx && f.y === cy)) {
                spawnX = cx;
                spawnY = cy;
                found = true;
                break;
              }
            }
          }
          if (found) break;
        }
        if (found) break;
      }

      const newFolder: Folder = {
        id: Date.now(),
        parentId: currentParentId,
        name: title.trim(),
        description: desc.trim(),
        icon,
        dotColor: color,
        x: spawnX,
        y: spawnY,
        todos: []
      };
      setFolders([...folders, newFolder]);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingFolderId) {
      // Recursively delete folder and children
      const deleteIds = new Set<number>([editingFolderId]);
      let added = true;
      while (added) {
        added = false;
        folders.forEach(f => {
          if (f.parentId !== null && deleteIds.has(f.parentId) && !deleteIds.has(f.id)) {
            deleteIds.add(f.id);
            added = true;
          }
        });
      }
      setFolders(prev => prev.filter(f => !deleteIds.has(f.id)));
    }
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto"
    >
      <div className="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-6 rounded-3xl shadow-2xl relative z-10 w-full max-w-md flex flex-col max-h-[90vh]"
      >
        <h2 className="text-xl font-bold mb-4 text-[var(--text-main)]">
          {editingFolderId ? 'Edit Folder' : 'New Folder'}
        </h2>
        
        <div className="overflow-y-auto pr-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--accent-muted)] uppercase mb-1">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 focus:outline-none focus:border-[var(--accent-muted)] text-[var(--text-main)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--accent-muted)] uppercase mb-1">Description</label>
            <textarea 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 focus:outline-none focus:border-[var(--accent-muted)] resize-none h-20 text-[var(--text-main)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--accent-muted)] uppercase mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-[var(--text-main)]' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--accent-muted)] uppercase mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {availableIcons.map(iconName => {
                const IconComp = iconMap[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-xl flex items-center justify-center transition-colors ${icon === iconName ? 'bg-[var(--accent-muted)] text-[var(--bg-main)]' : 'bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)]'}`}
                  >
                    <IconComp size={20} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border-color)]">
          {editingFolderId ? (
            <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 font-bold transition-colors">
              Delete
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl hover:bg-[var(--bg-panel-hover)] font-bold text-[var(--text-main)]">Cancel</button>
            <button onClick={handleSave} disabled={!title.trim()} className="px-4 py-2 rounded-xl bg-[var(--accent-muted)] text-[var(--bg-main)] font-bold hover:opacity-90 disabled:opacity-50">
              {editingFolderId ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SearchModal({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  searchResults,
  onSelect
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  searchQuery: string, 
  setSearchQuery: (q: string) => void,
  searchResults: Folder[],
  onSelect: (id: number) => void
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex items-start justify-center pt-20 p-4 pointer-events-auto"
    >
      <div className="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -20 }}
        className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl shadow-2xl relative z-10 w-full max-w-2xl flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3">
          <Search size={24} className="text-[var(--accent-muted)]" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search folders and tasks..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-lg focus:outline-none text-[var(--text-main)]"
          />
          <button onClick={onClose} className="text-[var(--accent-muted)] hover:text-[var(--text-main)] p-1">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        {searchQuery.trim() && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {searchResults.length === 0 ? (
              <div className="p-8 text-center text-[var(--accent-muted)]">No results found.</div>
            ) : (
              searchResults.map(folder => {
                const Icon = iconMap[folder.icon] || FolderIcon;
                return (
                  <button
                    key={folder.id}
                    onClick={() => onSelect(folder.id)}
                    className="w-full text-left p-4 hover:bg-[var(--bg-panel-hover)] rounded-2xl flex items-center gap-4 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-main)] border border-[var(--border-color)] group-hover:border-[var(--border-color-strong)] transition-colors">
                      <Icon size={24} style={{ color: folder.dotColor }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-main)]">{folder.name}</h3>
                      {folder.description && <p className="text-sm text-[var(--accent-muted)] truncate">{folder.description}</p>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
