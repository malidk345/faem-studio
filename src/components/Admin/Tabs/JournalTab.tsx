import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function JournalTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('journal').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setPosts(data);
    } catch (err) {
      console.warn('Journal table might be missing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const postData = {
      title: editingPost.title,
      excerpt: editingPost.excerpt,
      content: editingPost.content,
      image_url: editingPost.image_url,
      category: editingPost.category || 'Editorial',
      slug: editingPost.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    };

    if (editingPost.id) {
      await supabase.from('journal').update(postData).eq('id', editingPost.id);
    } else {
      await supabase.from('journal').insert([postData]);
    }
    setEditingPost(null);
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (confirm('Bu yazıyı silmek istediğinize emin misiniz?')) {
      await supabase.from('journal').delete().eq('id', id);
      fetchPosts();
    }
  };

  if (editingPost) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setEditingPost(null)} className="rounded-xl">
              <X size={20} />
            </Button>
            <h2 className="text-2xl font-black tracking-tight">{editingPost.id ? 'Yazıyı Düzenle' : 'Yeni Yazı'}</h2>
          </div>
          <Button onClick={handleSave} className="bg-black text-white rounded-2xl px-8 font-bold text-xs uppercase tracking-widest">
            <Save size={14} className="mr-2" /> Kaydet
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Başlık</Label>
              <Input 
                value={editingPost.title} 
                onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                className="rounded-xl h-12 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Kısa Özet</Label>
              <Textarea 
                value={editingPost.excerpt} 
                onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Kategori</Label>
              <Input 
                value={editingPost.category} 
                onChange={(e) => setEditingPost({...editingPost, category: e.target.value})}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Kapak Görseli URL</Label>
              <Input 
                value={editingPost.image_url} 
                onChange={(e) => setEditingPost({...editingPost, image_url: e.target.value})}
                className="rounded-xl"
              />
              {editingPost.image_url && (
                <img src={editingPost.image_url} className="w-full aspect-video object-cover rounded-2xl border" alt="Preview" />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">İçerik (Markdown Destekler)</Label>
          <Textarea 
            value={editingPost.content} 
            onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
            className="rounded-2xl min-h-[400px] p-6 font-medium leading-relaxed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Stüdyo Günlüğü</h2>
          <p className="text-zinc-400 text-xs font-medium">Marka hikayelerini ve editorial içerikleri yönetin.</p>
        </div>
        <Button onClick={() => setEditingPost({ title: '', excerpt: '', content: '', image_url: '', category: 'Editorial' })} className="bg-black text-white rounded-2xl px-6 font-bold h-12 uppercase text-[10px] tracking-widest">
          <Plus size={16} className="mr-2" /> Yeni İçerik Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <motion.div 
            key={post.id} 
            layoutId={post.id}
            className="group bg-white border border-zinc-100 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500"
          >
            <div className="aspect-video overflow-hidden">
              <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{post.category}</span>
                <span className="text-[10px] font-bold text-zinc-300">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-black tracking-tight leading-tight mb-3">{post.title}</h3>
              <p className="text-xs text-zinc-500 line-clamp-2 font-medium leading-relaxed mb-6">{post.excerpt}</p>
              
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-50">
                <Button variant="ghost" size="icon" onClick={() => setEditingPost(post)} className="w-10 h-10 rounded-xl hover:bg-zinc-100">
                  <Edit size={16} className="text-zinc-400 group-hover:text-black transition-colors" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)} className="w-10 h-10 rounded-xl hover:bg-rose-50 hover:text-rose-500">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-[3rem]">
          <BookOpen className="text-zinc-200 mb-4" size={48} />
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Henüz yazı bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}
