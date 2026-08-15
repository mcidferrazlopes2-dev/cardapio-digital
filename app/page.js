'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModalPagamento from './components/ModalPagamento';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Estados do Cardápio e do Modal de Pagamento
  const [cardapio, setCardapio] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Verifica se o usuário está autenticado e busca o cardápio
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        
        // Busca o cardápio existente do usuário
        const { data } = await supabase
          .from('cardapios')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) setCardapio(data);
      }
    };
    init();
  }, [router]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('cardapios')
      .insert([{ nome, slug, descricao, user_id: user.id }])
      .select()
      .single();

    if (error) {
      alert('Erro ao criar cardápio: ' + error.message);
    } else {
      setCardapio(data);
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
      {/* Banner de Pagamento Pendente (Exibido se o usuário já criou um cardápio e não pagou) */}
      {cardapio && cardapio.status_pagamento !== 'ativo' && (
        <div className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-amber-900 text-sm">Plano Pendente</h3>
            <p className="text-xs text-amber-700">Ative seu cardápio online por R$ 29,90/mês.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-green-700 transition shadow-sm whitespace-nowrap"
          >
            Ativar Agora
          </button>
        </div>
      )}

      {/* Box Principal de Criação/Gestão */}
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
              className="w-full p-2 border rounded mt-1 text-sm"
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
              className="w-full p-2 border rounded mt-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              placeholder="Ex: As melhores artesanais da cidade"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full p-2 border rounded mt-1 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 font-semibold transition"
          >
            {loading ? 'Criando...' : 'Criar Cardápio'}
          </button>
        </form>
      </div>

      {/* Modal de Pagamento PIX */}
      {cardapio && (
        <ModalPagamento
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cardapioId={cardapio.id}
          emailUsuario={user.email}
        />
      )}
    </div>
  );
}