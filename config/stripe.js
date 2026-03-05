const Stripe = require('stripe');

// Use the Secret Key from your environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // It is good practice to lock the API version
});
console.log("Stripe Key Loaded:", process.env.STRIPE_SECRET_KEY ? "Yes" : "No");

module.exports = stripe;