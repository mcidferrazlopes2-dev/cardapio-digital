import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const payment = new Payment(client);

export async function POST(request) {
  try {
    const { email, cardapioId } = await request.json();

    const body = {
      transaction_amount: 29.90,
      description: 'Assinatura Mensal Cardápio Digital',
      payment_method_id: 'pix',
      payer: { email },
      metadata: { cardapio_id: cardapioId },
    };

    const response = await payment.create({ body });

    return NextResponse.json({
      id: response.id,
      qr_code: response.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: response.point_of_interaction?.transaction_data?.ticket_url,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}