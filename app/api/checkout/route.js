import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'Chave MERCADOPAGO_ACCESS_TOKEN não configurada na Vercel.' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { cardapioId, emailUsuario } = body;

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({
        transaction_amount: 29.90,
        description: 'Assinatura Plano Mensal Cardápio Digital',
        payment_method_id: 'pix',
        payer: {
          email: emailUsuario || 'cliente@email.com',
          first_name: 'Cliente',
        },
        external_reference: String(cardapioId || '1'),
      }),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return NextResponse.json(
        { error: data.message || 'Erro do Mercado Pago' },
        { status: mpResponse.status }
      );
    }

    return NextResponse.json({
      qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      payment_id: data.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Falha no processamento interno' },
      { status: 500 }
    );
  }
}