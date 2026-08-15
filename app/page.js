'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Verifica se o usuário está autenticado ao carregar a página
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); // Redireciona para o login se não estiver logado
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('cardapios')
      .insert([{ nome, slug, descricao, user_id: user.id }]);

    if (error) {
      alert('Erro ao criar cardápio: ' + error.message);
    } else {
      router.push(`/${slug}/admin`);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) return <p className="p-4 text-center">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs text-gray-500">{user.email}</span>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
            Sair
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center mb-4">Criar Meu Cardápio</h1>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Estabelecimento</label>
            <input
              type="text"
              placeholder="Ex: Burger King"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Link Personalizado (slug)</label>
            <input
              type="text"
              placeholder="Ex: burger-king"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              placeholder="Ex: As melhores artesanais da cidade"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          >
            {loading ? 'Criando...' : 'Criar Cardápio'}
          </button>
        </form>
      </div>
    </div>
  );
}