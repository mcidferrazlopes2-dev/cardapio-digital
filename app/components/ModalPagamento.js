'use client';
import { useState } from 'react';

export default function ModalPagamento({ isOpen, onClose, cardapioId, emailUsuario }) {
  const [loading, setLoading] = useState(false);
  const [dadosPix, setDadosPix] = useState(null);
  const [copiado, setCopiado] = useState(false);

  if (!isOpen) return null;

  const gerarPix = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailUsuario, cardapioId }),
      });
      const data = await res.json();
      if (data.qr_code) {
        setDadosPix(data);
      } else {
        alert('Erro ao gerar PIX. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao gerar o pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const copiarChave = () => {
    if (dadosPix?.qr_code) {
      navigator.clipboard.writeText(dadosPix.qr_code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Ativar Assinatura</h2>
        <p className="text-sm text-gray-600 mb-6">Plano Mensal - R$ 29,90/mês</p>

        {!dadosPix ? (
          <button
            onClick={gerarPix}
            disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
          </button>
        ) : (
          <div className="space-y-4">
            {dadosPix.qr_code_base64 && (
              <img
                src={`data:image/png;base64,${dadosPix.qr_code_base64}`}
                alt="QR Code PIX"
                className="w-48 h-48 mx-auto rounded-lg border p-2"
              />
            )}
            <button
              onClick={copiarChave}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition"
            >
              {copiado ? '✓ Chave Copiada!' : 'Copiar Código PIX'}
            </button>
            <p className="text-xs text-gray-500">
              Após o pagamento, a liberação do seu cardápio ocorrerá automaticamente em instantes.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}