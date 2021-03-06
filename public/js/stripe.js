/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';
export const bookTour = async (tourId) => {
  const stripe = Stripe('pk_test_rIvBpbWrcLPedOVubclyzUrq003GGC1jlf');
  
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
