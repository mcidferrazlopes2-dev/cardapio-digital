import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { supabase } from '@/lib/supabase';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const payment = new Payment(client);

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (!dataId) {
      const body = await request.json().catch(() => ({}));
      if (body.data?.id) return await handlePaymentUpdate(body.data.id);
      return NextResponse.json({ received: true });
    }

    return await handlePaymentUpdate(dataId);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handlePaymentUpdate(paymentId) {
  const paymentInfo = await payment.get({ id: paymentId });

  if (paymentInfo.status === 'approved') {
    const cardapioId = paymentInfo.metadata?.cardapio_id;
    if (cardapioId) {
      await supabase
        .from('cardapios')
        .update({ status_pagamento: 'ativo', mp_payment_id: paymentId.toString() })
        .eq('id', cardapioId);
    }
  }

  return NextResponse.json({ status: 'success' });
}