'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [slug, setSlug] = useState('')
  const [mensagem, setMensagem] = useState('')

  const criarCardapio = async (e) => {
    e.preventDefault()
    setMensagem('Criando cardápio...')

    const slugFormatado = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')

    const { data, error } = await supabase
      .from('cardapios')
      .insert([
        {
          nome_estabelecimento: nome,
          descricao,
          slug: slugFormatado,
        },
      ])
      .select()

    if (error) {
      setMensagem('Erro ao criar: ' + error.message)
    } else {
      setMensagem(`Cardápio criado com sucesso! Link: /${slugFormatado}`)
      setNome('')
      setDescricao('')
      setSlug('')
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Criar Meu Cardápio</h1>
      <form onSubmit={criarCardapio} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Estabelecimento</label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border rounded text-black"
            placeholder="Ex: Burger King"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Link Personalizado (slug)</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-2 border rounded text-black"
            placeholder="Ex: burger-king"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 border rounded text-black"
            placeholder="Ex: As melhores artesanais da cidade"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
          Criar Cardápio
        </button>
      </form>
      {mensagem && <p className="mt-4 text-center font-medium">{mensagem}</p>}
    </main>
  )
}