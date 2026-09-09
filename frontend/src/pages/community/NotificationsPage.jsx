import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Check, Loader2 } from 'lucide-react';
import api from '../../api';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    api.get('/social/notifications')
      .then((r) => setNotifications(r.data))
      .catch((err) => console.error('Error al cargar notificaciones:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await api.put('/social/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error al marcar leídas:', err);
    } finally {
      setMarking(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="fill-red-500 text-red-500" />;
      case 'comment':
        return <MessageCircle size={16} className="text-accent" />;
      case 'follow':
        return <UserPlus size={16} className="text-green-400" />;
      case 'mention':
        return <AtSign size={16} className="text-yellow-400" />;
      default:
        return <Bell size={16} className="text-accent" />;
    }
  };

  const getNotificationText = (n) => {
    const sender = n.senderProfile?.displayName || 'Un usuario';
    switch (n.type) {
      case 'like':
        return <span>le dio me gusta a tu publicación.</span>;
      case 'comment':
        return <span>comentó en tu publicación.</span>;
      case 'follow':
        return <span>comenzó a seguirte.</span>;
      case 'mention':
        return <span>te mencionó en una publicación o comentario.</span>;
      default:
        return <span>interactuó contigo.</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Notificaciones</h1>
            <p className="text-xs text-white/50">Actividad reciente de la comunidad</p>
          </div>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            className="flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/30 px-3.5 py-1.5 text-xs font-bold text-accent hover:bg-accent hover:text-white transition disabled:opacity-50"
          >
            <Check size={14} />
            <span>Marcar leídas</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl bg-secondary/60 border border-accent/20 p-12 text-center text-white/50 text-xs">
          No tienes notificaciones por el momento.
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const sender = n.senderProfile || {};
            return (
              <div
                key={n._id}
                className={`flex items-center gap-3.5 rounded-2xl p-4 transition border ${
                  n.read
                    ? 'bg-secondary/70 border-white/5'
                    : 'bg-secondary border-accent/40 shadow-md shadow-accent/5'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Link to={`/comunidad/perfil/${sender.username || ''}`}>
                    {sender.avatar ? (
                      <img
                        src={sender.avatar}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
                        {sender.username ? sender.username[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </Link>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-secondary p-1 border border-white/10 shadow">
                    {getNotificationIcon(n.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-xs leading-relaxed">
                  <p className="text-white/90">
                    <Link
                      to={`/comunidad/perfil/${sender.username || ''}`}
                      className="font-extrabold text-white hover:text-accent-light transition mr-1"
                    >
                      {sender.displayName || `@${sender.username}`}
                    </Link>
                    {getNotificationText(n)}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {n.post && (
                  <Link
                    to={`/comunidad?post=${n.post._id}`}
                    className="h-12 w-12 rounded-xl overflow-hidden bg-primary border border-white/10 flex-shrink-0"
                  >
                    {n.post.media?.[0]?.url ? (
                      <img
                        src={n.post.media[0].url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center p-1 text-[9px] text-white/50 text-center line-clamp-2">
                        {n.post.content?.slice(0, 30)}
                      </div>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
