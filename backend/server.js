require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
// Create a new route to get all payments
app.get('/get-successful-payments', async (req, res) => {
  try {
    // Retrieve a list of successful payment intents from Stripe
    const payments = await stripe.paymentIntents.list({
      limit: 10,
      status: 'refunded',
    });

    res.json({ successfulPayments: payments.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
});

// Endpoint for creating a checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: req.body.items.map((item) => {
        return {
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        };
      }),
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
});

// Start the server
app.listen(500, () => {
  console.log('Server is running on port 5000');
});
