import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HighlightViewerModal({ highlight, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const items = highlight?.items || [];
  const currentItem = items[currentIndex];
  const authorProfile = highlight?.authorProfile || {};

  // Auto-avance de historias cada 5 segundos si no está pausado
  useEffect(() => {
    if (!highlight || items.length === 0 || isPaused) return;

    timerRef.current = setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, isPaused, items.length, highlight, onClose]);

  if (!highlight || items.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-[85vh] max-h-[750px] rounded-3xl overflow-hidden bg-secondary border border-accent/40 shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Barras de progreso superior */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
          {items.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className={`h-full bg-accent transition-all duration-300 ${
                  idx < currentIndex
                    ? 'w-full'
                    : idx === currentIndex
                    ? isPaused
                      ? 'w-1/2'
                      : 'w-full transition-all duration-[5000ms] ease-linear'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Cabecera: Autor y Título */}
        <div className="absolute top-6 left-4 right-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {authorProfile.avatar ? (
              <img
                src={authorProfile.avatar}
                alt=""
                className="h-8 w-8 rounded-full object-cover border-2 border-accent"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                {authorProfile.username ? authorProfile.username[0].toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                {authorProfile.displayName || authorProfile.username || 'Destacado'}
              </p>
              <p className="text-[10px] text-accent font-semibold">{highlight.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-full text-white/70 hover:bg-white/20"
              title={isPaused ? 'Reanudar' : 'Pausar'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/70 hover:bg-white/20"
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenido multimedia de la historia */}
        <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative">
          {currentItem?.mediaType === 'video' ? (
            <video
              src={currentItem.mediaUrl}
              autoPlay
              playsInline
              muted
              loop
              className="w-full h-full object-cover sm:object-contain"
            />
          ) : (
            <img
              src={currentItem?.mediaUrl}
              alt=""
              className="w-full h-full object-cover sm:object-contain"
            />
          )}

          {/* Navegadores de clic invisible en pantalla */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* Flechas visibles */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition z-20"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {currentIndex < items.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition z-20"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Pie: Caption */}
        {currentItem?.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-8 text-center text-xs text-white/90 z-30">
            <p className="font-medium leading-relaxed max-w-xs mx-auto">{currentItem.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
