import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'motion/react';
import { 
  Briefcase, User, Heart, Lightbulb, DollarSign, HomeIcon, 
  Plane, Book, Dumbbell, Users, Folder as FolderIcon, Archive, 
  Plus, Check, ChevronLeft, Trash2, ShoppingCart, Coffee, Music, Video,
  Camera, Gamepad, Map, Mail, Calendar, Settings, Clock, Cloud,
  CircleDashed, CircleDot, CheckCircle2, Edit2, Sun, Moon
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  
  const dragTargetRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

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

      folders.forEach(folder => {
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

  const handleDragStart = (folderId: number) => {
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
    if (dragTargetRef.current) {
      dragTargetRef.current.style.display = 'none';
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

  const handleCreateFolder = () => {
    if (!newFolderTitle.trim()) return;
    
    let spawnX = Math.floor(GRID_COLS / 2);
    let spawnY = Math.floor(GRID_ROWS / 2);
    
    let found = false;
    for (let r = 0; r < Math.max(GRID_COLS, GRID_ROWS); r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          const cx = spawnX + dx;
          const cy = spawnY + dy;
          if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
            if (!folders.some(f => f.x === cx && f.y === cy)) {
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
      name: newFolderTitle.trim(),
      icon: 'Folder',
      dotColor: '#8b5cf6',
      x: spawnX,
      y: spawnY,
      todos: []
    };
    setFolders([...folders, newFolder]);
    setIsNewFolderModalOpen(false);
    setNewFolderTitle('');
    setNewFolderDesc('');
  };

  const emptySlots = [];
  if (isEditMode) {
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const isOccupied = folders.some(f => f.x === x && f.y === y);
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

  return (
    <div className="w-full h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-mono selection:bg-[var(--accent-muted)] selection:text-[var(--bg-main)] overflow-hidden flex flex-col relative transition-colors duration-300">
      
      {/* Header / Settings Zone */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
        
        {/* Settings Zone */}
        <div className="pointer-events-auto relative flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-3 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl shadow-xl text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)] transition-all flex items-center justify-center"
            >
              <Settings size={24} />
            </button>
            
            {/* Dropdown */}
            {isSettingsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSettingsOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-20">
                  <button onClick={() => { setIsNewFolderModalOpen(true); setIsSettingsOpen(false); }} className="px-4 py-3 text-left hover:bg-[var(--bg-panel-hover)] flex items-center gap-3 text-sm font-bold border-b border-[var(--border-color)]">
                    <Plus size={18} /> New Folder
                  </button>
                  <button onClick={() => { setIsEditMode(!isEditMode); setIsSettingsOpen(false); }} className="px-4 py-3 text-left hover:bg-[var(--bg-panel-hover)] flex items-center gap-3 text-sm font-bold border-b border-[var(--border-color)]">
                    <Edit2 size={18} /> {isEditMode ? 'Done Editing' : 'Edit Layout'}
                  </button>
                  <button onClick={() => { setTheme(t => t === 'dark' ? 'light' : 'dark'); setIsSettingsOpen(false); }} className="px-4 py-3 text-left hover:bg-[var(--bg-panel-hover)] flex items-center gap-3 text-sm font-bold">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} Toggle Theme
                  </button>
                </div>
              </>
            )}
          </div>

          <AnimatePresence>
            {isEditMode && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-red-500 font-bold text-sm flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Editing Layout
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-right pointer-events-auto">
          <h1 className="text-3xl font-bold tracking-widest uppercase leading-none text-[var(--text-main)] drop-shadow-md">GridDo</h1>
          <div className="text-[var(--text-main)] text-sm font-bold bg-[var(--bg-panel)]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border-color)] shadow-lg mt-3 inline-block">
            {folders.reduce((acc, f) => acc + f.todos.filter(t => !t.done).length, 0)} Tasks
          </div>
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

          {folders.map(folder => (
            <DraggableFolder 
              key={folder.id}
              folder={folder} 
              onDragStart={() => handleDragStart(folder.id)}
              onDragUpdate={handleDragUpdate}
              onDragEnd={handleDragEnd} 
              onClick={() => { if (!isPanning) setSelectedFolderId(folder.id); }} 
            />
          ))}
        </div>
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {isNewFolderModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto"
          >
            <div className="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" onClick={() => setIsNewFolderModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-6 rounded-3xl shadow-2xl relative z-10 w-full max-w-sm"
            >
              <h2 className="text-xl font-bold mb-4 text-[var(--text-main)]">New Folder</h2>
              <input 
                type="text" 
                placeholder="Title" 
                value={newFolderTitle} 
                onChange={e => setNewFolderTitle(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 mb-3 focus:outline-none focus:border-[var(--accent-muted)] text-[var(--text-main)]"
              />
              <textarea 
                placeholder="Description (optional)" 
                value={newFolderDesc} 
                onChange={e => setNewFolderDesc(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 mb-4 focus:outline-none focus:border-[var(--accent-muted)] resize-none h-24 text-[var(--text-main)]"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsNewFolderModalOpen(false)} className="px-4 py-2 rounded-xl hover:bg-[var(--bg-panel-hover)] font-bold text-[var(--text-main)]">Cancel</button>
                <button onClick={handleCreateFolder} className="px-4 py-2 rounded-xl bg-[var(--accent-muted)] text-[var(--bg-main)] font-bold hover:opacity-90">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder View Modal */}
      <AnimatePresence>
        {selectedFolder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none"
          >
            <div className="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-md pointer-events-auto" onClick={() => setSelectedFolderId(null)} />
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-6xl bg-[var(--bg-panel)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] flex flex-col h-[85vh] pointer-events-auto relative z-10"
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

function DraggableFolder({ folder, onDragStart, onDragUpdate, onDragEnd, onClick }: { folder: Folder, onDragStart: () => void, onDragUpdate: (x: number, y: number) => void, onDragEnd: (id: number, info: PanInfo) => void, onClick: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const Icon = iconMap[folder.icon];
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
        className="w-full h-full bg-[var(--bg-panel)] rounded-3xl p-3 flex flex-col cursor-pointer hover:bg-[var(--bg-panel-hover)] transition-colors border border-[var(--border-color)] group shadow-lg origin-center"
      >
        {pendingCount > 0 && (
          <div 
            className="absolute -top-2 -right-2 flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded-full text-[11px] font-bold text-[#101015] z-10 shadow-md border-2 border-[var(--bg-panel)]" 
            style={{ backgroundColor: folder.dotColor }}
          >
            {pendingCount}
          </div>
        )}
        
        <div className="flex-grow flex items-center justify-center">
          {Icon && <Icon size={36} className="text-[var(--text-main)] opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: folder.dotColor }} />}
        </div>

        <div className="text-center text-xs font-bold text-[var(--accent-muted)] mt-1 truncate">
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
      <div className="p-6 flex items-center gap-4 border-b border-[var(--border-color)] bg-[var(--bg-panel)] shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-[var(--bg-panel-hover)] rounded-full transition-colors text-[var(--accent-muted)] hover:text-[var(--text-main)]">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${folder.dotColor}20`, color: folder.dotColor }}>
            {Icon && <Icon size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide uppercase text-[var(--text-main)]">{folder.name}</h2>
            <p className="text-xs text-[var(--accent-muted)] font-bold mt-0.5">{folder.todos.length} Tasks</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Column: Task List */}
        <div className="w-1/3 border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-main)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {folder.todos.length === 0 ? (
              <div className="text-center text-[var(--accent-muted)] mt-10 text-sm flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-panel)] flex items-center justify-center">
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
                      ? 'bg-[var(--bg-panel-hover)] border-[var(--border-color-strong)] shadow-md' 
                      : 'bg-[var(--bg-panel)] border-[var(--border-color)] hover:border-[var(--border-color-strong)] shadow-sm'
                  }`}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id); }} 
                    className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors shrink-0 ${
                      todo.done ? 'bg-[var(--accent-muted)] border-[var(--accent-muted)] text-[var(--bg-main)]' : 'border-[var(--accent-muted)] hover:border-[var(--text-main)]'
                    }`}
                  >
                    {todo.done && <Check size={16} strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate transition-colors ${todo.done ? 'text-[var(--accent-muted)] line-through' : 'text-[var(--text-main)]'}`}>
                      {todo.text}
                    </p>
                    {todo.phases.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {todo.phases.map((p, i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full ${p.completed ? 'bg-[var(--accent-muted)]' : 'bg-[var(--border-color-strong)]'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} 
                    className="opacity-0 group-hover:opacity-100 p-2 text-[var(--accent-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-panel)] shrink-0">
            <form onSubmit={handleAdd} className="relative">
              <input 
                type="text" 
                value={newTask} 
                onChange={(e) => setNewTask(e.target.value)} 
                placeholder="Add a new task..." 
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color-strong)] rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-[var(--accent-muted)] transition-colors placeholder:text-[var(--accent-muted)] text-[var(--text-main)] shadow-inner" 
              />
              <button type="submit" disabled={!newTask.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--accent-muted)] text-[var(--bg-main)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-80 hover:scale-105 active:scale-95">
                <Plus size={20} strokeWidth={3} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Task Details */}
        <div className="flex-1 bg-[var(--bg-main)] overflow-y-auto">
          {selectedTodo ? (
            <div className="p-8 max-w-2xl mx-auto">
              <div className="mb-8">
                <input
                  type="text"
                  value={selectedTodo.text}
                  onChange={(e) => updateTodoDetails(selectedTodo.id, { text: e.target.value })}
                  className="w-full bg-transparent text-3xl font-bold text-[var(--text-main)] focus:outline-none border-b border-transparent focus:border-[var(--border-color-strong)] pb-2 transition-colors"
                  placeholder="Task title"
                />
              </div>

              <div className="space-y-8">
                {/* Description Section */}
                <section>
                  <h3 className="text-sm font-bold text-[var(--accent-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Archive size={16} /> Description
                  </h3>
                  <textarea
                    value={selectedTodo.description || ''}
                    onChange={(e) => updateTodoDetails(selectedTodo.id, { description: e.target.value })}
                    placeholder="Add a more detailed description..."
                    className="w-full bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-muted)] transition-colors min-h-[120px] resize-y"
                  />
                </section>

                {/* Phases / Timeline Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[var(--accent-muted)] uppercase tracking-wider flex items-center gap-2">
                      <Clock size={16} /> Phases & Timeline
                    </h3>
                    <button 
                      onClick={() => addPhase(selectedTodo.id)}
                      className="text-xs bg-[var(--border-color)] hover:bg-[var(--border-color-strong)] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[var(--text-main)]"
                    >
                      <Plus size={14} /> Add Phase
                    </button>
                  </div>

                  <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-2">
                    {selectedTodo.phases.length === 0 ? (
                      <div className="p-6 text-center text-[var(--accent-muted)] text-sm">
                        No phases added yet. Break down your task into smaller steps.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {selectedTodo.phases.map((phase, index) => (
                          <div key={phase.id} className="flex items-center gap-3 p-3 hover:bg-[var(--border-color)] rounded-xl transition-colors group">
                            <button 
                              onClick={() => togglePhase(selectedTodo.id, phase.id)}
                              className="text-[var(--accent-muted)] hover:text-[var(--text-main)] transition-colors"
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
                              className={`flex-1 bg-transparent focus:outline-none text-sm transition-colors ${phase.completed ? 'text-[var(--accent-muted)] line-through' : 'text-[var(--text-main)]'}`}
                            />
                            <button 
                              onClick={() => {
                                const newPhases = selectedTodo.phases.filter(p => p.id !== phase.id);
                                updateTodoDetails(selectedTodo.id, { phases: newPhases });
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--accent-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
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
            <div className="h-full flex flex-col items-center justify-center text-[var(--accent-muted)]">
              <FolderIcon size={48} className="opacity-20 mb-4" />
              <p>Select a task to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
