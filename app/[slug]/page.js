'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'

export default function CardapioPage({ params }) {
  const { slug } = use(params)
  const [cardapio, setCardapio] = useState(null)
  const [carrinho, setCarrinho] = useState([])
  const [nomeCliente, setNomeCliente] = useState('')
  const [endereco, setEndereco] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('Pix')
  const [trocoPara, setTrocoPara] = useState('')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  // IMPORTANTE: Insira seu número com DDD (somente números)
  const TELEFONE_WHATSAPP = '5511997419699'

  useEffect(() => {
    async function carregarCardapio() {
      const { data, error } = await supabase
        .from('cardapios')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setErro('Cardápio não encontrado!')
      } else {
        setCardapio(data)
      }
      setLoading(false)
    }

    carregarCardapio()
  }, [slug])

  const adicionarAoCarrinho = (item) => {
    setCarrinho((prev) => [...prev, item])
  }

  const removerDoCarrinho = (index) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index))
  }

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + parseFloat(item.preco || 0), 0).toFixed(2)
  }

  const enviarPedidoWhatsApp = (e) => {
    e.preventDefault()
    if (carrinho.length === 0) return alert('Seu carrinho está vazio!')

    let mensagem = `*Novo Pedido - ${cardapio.nome_estabelecimento}*\n\n`
    mensagem += `*Cliente:* ${nomeCliente}\n`
    mensagem += `*Endereço:* ${endereco}\n`
    mensagem += `*Forma de Pagamento:* ${formaPagamento}\n`
    if (formaPagamento === 'Dinheiro' && trocoPara) {
      mensagem += `*Troco para:* R$ ${trocoPara}\n`
    }
    mensagem += `\n*Itens do Pedido:*\n`

    carrinho.forEach((item) => {
      mensagem += `- ${item.nome}: R$ ${item.preco}\n`
    })

    mensagem += `\n*Total:* R$ ${calcularTotal()}`

    const linkWhatsApp = `https://wa.me/${TELEFONE_WHATSAPP}?text=${encodeURIComponent(mensagem)}`
    window.open(linkWhatsApp, '_blank')
  }

  if (loading) return <div className="p-8 text-center">Carregando cardápio...</div>
  if (erro) return <div className="p-8 text-center text-red-500 font-bold">{erro}</div>

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto bg-gray-50 text-gray-900 pb-24">
      <header className="text-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">{cardapio.nome_estabelecimento}</h1>
        {cardapio.descricao && <p className="text-gray-600 mt-2">{cardapio.descricao}</p>}
      </header>

      <section className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Cardápio</h2>
        {cardapio.itens && cardapio.itens.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {cardapio.itens.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b pb-3">
                <div className="pr-2">
                  <p className="font-semibold text-base">{item.nome}</p>
                  <p className="text-xs text-gray-500">{item.descricao}</p>
                  <span className="font-bold text-green-600 text-sm mt-1 block">R$ {item.preco}</span>
                </div>
                <button
                  onClick={() => adicionarAoCarrinho(item)}
                  className="bg-green-600 text-white text-xs px-3 py-2 rounded font-bold hover:bg-green-700 whitespace-nowrap"
                >
                  + Adicionar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhum item cadastrado.</p>
        )}
      </section>

      {carrinho.length > 0 && (
        <section className="bg-white p-4 rounded-lg shadow-md border border-green-200">
          <h2 className="text-xl font-bold mb-3 border-b pb-2 text-green-700">
            Seu Pedido ({carrinho.length})
          </h2>
          <ul className="flex flex-col gap-2 mb-4">
            {carrinho.map((item, i) => (
              <li key={i} className="flex justify-between items-center text-sm border-b pb-1">
                <span>{item.nome} - R$ {item.preco}</span>
                <button
                  onClick={() => removerDoCarrinho(i)}
                  className="text-red-500 text-xs font-bold px-2 py-1"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-between font-bold text-lg mb-4 text-gray-900 border-t pt-2">
            <span>Total:</span>
            <span className="text-green-600">R$ {calcularTotal()}</span>
          </div>

          <form onSubmit={enviarPedidoWhatsApp} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Seu Nome"
              required
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="p-2 border rounded text-sm bg-gray-50"
            />
            <input
              type="text"
              placeholder="Endereço de Entrega"
              required
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="p-2 border rounded text-sm bg-gray-50"
            />

            <label className="text-xs font-semibold text-gray-600 -mb-1">Forma de Pagamento:</label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="p-2 border rounded text-sm bg-gray-50"
            >
              <option value="Pix">Pix</option>
              <option value="Cartão de Crédito/Débito">Cartão (Débito/Crédito na Entrega)</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>

            {formaPagamento === 'Dinheiro' && (
              <input
                type="text"
                placeholder="Precisa de troco para quanto? (ex: 50.00)"
                value={trocoPara}
                onChange={(e) => setTrocoPara(e.target.value)}
                className="p-2 border rounded text-sm bg-gray-50"
              />
            )}

            <button
              type="submit"
              className="bg-green-600 text-white py-3 rounded-lg font-bold text-center hover:bg-green-700 transition mt-2"
            >
              Enviar Pedido via WhatsApp
            </button>
          </form>
        </section>
      )}
    </main>
  )
}