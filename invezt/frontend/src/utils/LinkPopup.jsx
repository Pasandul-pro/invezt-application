import { useCallback, useEffect, useRef, useState } from 'react';

const FloatingWindow = ({ id, url, title, zIndex, onFocus, onClose, initialPosition }) => {
    const windowRef = useRef(null);
    const [position, setPosition] = useState(initialPosition || { x: 80, y: 80 });
    const [size, setSize] = useState({ width: 700, height: 500 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

    // Drag handlers
    const handleDragStart = useCallback((e) => {
        if (e.target.closest('button')) return;
        onFocus(id);
        const rect = windowRef.current.getBoundingClientRect();
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        setIsDragging(true);
    }, [id, onFocus]);

    const handleDrag = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 200));
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 50));
        setPosition({ x: newX, y: newY });
    }, [isDragging]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    // Resize handlers
    const handleResizeStart = useCallback((e) => {
        e.stopPropagation();
        onFocus(id);
        resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
        setIsResizing(true);
    }, [id, onFocus, size]);

    const handleResize = useCallback((e) => {
        if (!isResizing) return;
        e.preventDefault();
        const dw = e.clientX - resizeStart.current.x;
        const dh = e.clientY - resizeStart.current.y;
        setSize({
            width: Math.max(350, resizeStart.current.w + dw),
            height: Math.max(250, resizeStart.current.h + dh),
        });
    }, [isResizing]);

    useEffect(() => {
        const onMove = (e) => {
            if (isDragging) handleDrag(e);
            if (isResizing) handleResize(e);
        };
        const onUp = () => handleDragEnd();

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [isDragging, isResizing, handleDrag, handleResize, handleDragEnd]);

    const handleOpenNewTab = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            ref={windowRef}
            onMouseDown={() => onFocus(id)}
            className="fixed animate-slideUp"
            style={{
                left: position.x,
                top: position.y,
                width: isMinimized ? 320 : size.width,
                height: isMinimized ? 'auto' : size.height,
                zIndex: zIndex,
                transition: isDragging || isResizing ? 'none' : 'width 0.3s, height 0.3s',
            }}
        >
            <div className={`w-full h-full flex flex-col rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-slate-600/40 ${isDragging ? '' : 'transition-shadow'} hover:shadow-blue-500/10`}
                style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)' }}>

                {/* Title Bar – Draggable */}
                <div
                    className="flex items-center justify-between px-3 py-2 bg-slate-800/90 cursor-grab active:cursor-grabbing select-none shrink-0 border-b border-slate-700/50"
                    onMouseDown={handleDragStart}
                >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Traffic lights */}
                        <div className="flex items-center gap-1.5 shrink-0 mr-1">
                            <button onClick={() => onClose(id)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors flex items-center justify-center group" title="Close">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-red-900 opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <button onClick={() => setIsMinimized(!isMinimized)} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors flex items-center justify-center group" title={isMinimized ? "Expand" : "Minimize"}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-yellow-900 opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                </svg>
                            </button>
                            <button onClick={handleOpenNewTab} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors flex items-center justify-center group" title="Open in new tab">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-green-900 opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            </button>
                        </div>
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <span className="text-xs font-semibold text-slate-300 truncate">{title}</span>
                    </div>
                </div>

                {/* Content */}
                {!isMinimized && (
                    <div className="flex-1 relative bg-white overflow-hidden">
                        {!iframeLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-xs text-slate-400">Loading...</span>
                                </div>
                            </div>
                        )}
                        <iframe
                            src={url}
                            title={title}
                            className="w-full h-full border-0"
                            style={{ pointerEvents: isDragging || isResizing ? 'none' : 'auto' }}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            loading="lazy"
                            onLoad={() => setIframeLoaded(true)}
                        />
                        {/* Resize handle */}
                        <div
                            className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize group z-10"
                            onMouseDown={handleResizeStart}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors absolute bottom-0.5 right-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22 22H20V20H22V22ZM22 18H18V22H22V18ZM22 14H14V22H22V14Z" opacity="0.5" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Minimized state URL bar */}
                {isMinimized && (
                    <div className="px-3 py-2 border-t border-slate-700/50">
                        <p className="text-[10px] text-slate-500 truncate">{url}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingWindow;
