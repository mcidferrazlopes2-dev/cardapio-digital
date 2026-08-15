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

'use client';
import { useState, useEffect } from 'react';
import ModalPagamento from './components/ModalPagamento'; // Ajuste o caminho do arquivo se necessário
import { supabase } from '@/lib/supabase';

export default function Painel() {
  const [cardapio, setCardapio] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Busca os dados do cardápio do usuário logado
  useEffect(() => {
    async function carregarCardapio() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('cardapios')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) setCardapio(data);
      }
    }
    carregarCardapio();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Banner só aparece se o pagamento estiver pendente */}
      {cardapio && cardapio.status_pagamento !== 'ativo' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-amber-900">Seu plano está pendente</h3>
            <p className="text-sm text-amber-700">Ative sua assinatura para manter seu cardápio online e receber pedidos.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-green-700 transition shadow-sm whitespace-nowrap"
          >
            Ativar por R$ 29,90/mês
          </button>
        </div>
      )}

      {/* Conteúdo principal do seu painel (Categorias, Produtos, etc) */}
      <h1 className="text-2xl font-bold mb-4">Gerenciador do Cardápio</h1>

      {/* Modal de Pagamento PIX */}
      {cardapio && (
        <ModalPagamento
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cardapioId={cardapio.id}
          emailUsuario={cardapio.email || 'cliente@email.com'}
        />
      )}
    </div>
  );
}