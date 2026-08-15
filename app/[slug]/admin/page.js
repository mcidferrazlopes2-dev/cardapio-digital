'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage({ params }) {
  const { slug } = use(params)
  const [cardapio, setCardapio] = useState(null)
  const [itens, setItens] = useState([])
  const [nomeItem, setNomeItem] = useState('')
  const [descItem, setDescItem] = useState('')
  const [precoItem, setPrecoItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('cardapios')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data) {
        setCardapio(data)
        setItens(data.itens || [])
      }
      setLoading(false)
    }
    carregar()
  }, [slug])

  const adicionarItem = async (e) => {
    e.preventDefault()
    setStatus('Salvando...')

    const novosItens = [...itens, { nome: nomeItem, descricao: descItem, preco: precoItem }]

    const { error } = await supabase
      .from('cardapios')
      .update({ itens: novosItens })
      .eq('id', cardapio.id)

    if (error) {
      setStatus('Erro ao salvar item.')
    } else {
      setItens(novosItens)
      setNomeItem('')
      setDescItem('')
      setPrecoItem('')
      setStatus('Item adicionado com sucesso!')
    }
  }

  const removerItem = async (indexParaRemover) => {
    const novosItens = itens.filter((_, index) => index !== indexParaRemover)

    const { error } = await supabase
      .from('cardapios')
      .update({ itens: novosItens })
      .eq('id', cardapio.id)

    if (!error) {
      setItens(novosItens)
      setStatus('Item removido com sucesso!')
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando painel...</div>

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto text-gray-900">
      <h1 className="text-2xl font-bold mb-2 text-center">Painel: {cardapio?.nome_estabelecimento}</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">Cadastre os produtos do seu cardápio</p>

      <form onSubmit={adicionarItem} className="flex flex-col gap-3 bg-gray-50 p-4 rounded border mb-6">
        <h2 className="font-semibold text-lg">Novo Item</h2>
        <input
          type="text"
          placeholder="Nome do produto (ex: X-Salada)"
          required
          value={nomeItem}
          onChange={(e) => setNomeItem(e.target.value)}
          className="p-2 border rounded text-black bg-white"
        />
        <input
          type="text"
          placeholder="Descrição (ex: Pão, hambúrguer, queijo)"
          value={descItem}
          onChange={(e) => setDescItem(e.target.value)}
          className="p-2 border rounded text-black bg-white"
        />
        <input
          type="text"
          placeholder="Preço (ex: 25.00)"
          required
          value={precoItem}
          onChange={(e) => setPrecoItem(e.target.value)}
          className="p-2 border rounded text-black bg-white"
        />
        <button type="submit" className="bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700">
          Adicionar ao Cardápio
        </button>
      </form>

      {status && <p className="mb-4 text-center text-sm font-medium">{status}</p>}

      <section>
        <h2 className="font-semibold text-lg mb-3">Itens Cadastrados ({itens.length})</h2>
        <ul className="flex flex-col gap-2">
          {itens.map((item, i) => (
            <li key={i} className="p-3 border rounded flex justify-between items-center bg-white">
              <div>
                <p className="font-bold">{item.nome}</p>
                <p className="text-xs text-gray-500">{item.descricao}</p>
                <span className="font-semibold text-green-600 text-sm">R$ {item.preco}</span>
              </div>
              <button
                onClick={() => removerItem(i)}
                className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}