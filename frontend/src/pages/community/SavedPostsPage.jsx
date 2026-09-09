import { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/useAuth';
import PostCard from './PostCard';

export default function SavedPostsPage() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.username) return;
    api.get(`/social/profiles/${profile.username}/saved`)
      .then((r) => setPosts(r.data || []))
      .catch((err) => console.error('Error al cargar guardados:', err))
      .finally(() => setLoading(false));
  }, [profile?.username]);

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Bookmark size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Publicaciones Guardadas</h1>
          <p className="text-xs text-white/50">Tus jugadas y momentos favoritos de la comunidad</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl bg-secondary/60 border border-accent/20 p-12 text-center text-white/50 text-xs">
          Aún no tienes publicaciones guardadas. Pulsa el icono de marcador en cualquier post para
          guardarlo aquí.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onPostDeleted={handlePostDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
