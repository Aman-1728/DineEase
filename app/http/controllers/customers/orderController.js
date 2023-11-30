const Order = require('../../../models/order');
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
    return {
        async store(req, res) {
            try {
                // Validate request
                const { phone, address, stripeToken, paymentType } = req.body;
                if (!phone || !address) {
                    return res.status(422).json({ message: 'All fields are required' });
                }

                const order = new Order({
                    customerId: req.user._id,
                    items: req.session.cart.items,
                    phone,
                    address
                });

                const result = await order.save();
                const placedOrder = await Order.populate(result, { path: 'customerId' });

                // Stripe payment
                if (paymentType === 'card') {
                    // const charge = await stripe.paymentIntents.create({
                    //     amount: req.session.cart.totalPrice * 100,
                    //     source: stripeToken,
                    //     currency: 'inr',
                    //     description: `Pizza order: ${placedOrder._id}`

                    // });

                    const paymentMethod = await stripe.paymentMethods.create({
                        type: 'card',
                        card: {
                            token: stripeToken,
                        },
                    });
                    
                    const paymentIntent = await stripe.paymentIntents.create({
                        amount: req.session.cart.totalPrice * 100,
                        payment_method: paymentMethod.id,
                        currency: 'inr',
                        description: `Pizza order: ${placedOrder._id}`
                    });

                    placedOrder.paymentStatus = true;
                    placedOrder.paymentType = paymentType;

                    // Save the order with payment information
                    await placedOrder.save();

                    // Emit orderPlaced event
                    const eventEmitter = req.app.get('eventEmitter');
                    eventEmitter.emit('orderPlaced', placedOrder);

                    delete req.session.cart;
                    return res.json({ message: 'Payment successful, Order placed successfully' });
                } else {
                    // If paymentType is not 'card', delete the cart and respond
                    delete req.session.cart;
                    return res.json({ message: 'Order placed successfully' });
                }
            } catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Something went wrong' });
            }
        },

        async index(req, res) {
            try {
                const orders = await Order.find({ customerId: req.user._id })
                    .sort({ createdAt: -1 });

                res.header('Cache-Control', 'no-store');
                res.render('customers/orders', { orders, moment });
            } catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Something went wrong' });
            }
        },

        async show(req, res) {
            try {
                const order = await Order.findById(req.params.id);

                // Authorize user
                if (req.user._id.toString() === order.customerId.toString()) {
                    return res.render('customers/singleOrder', { order });
                } else {
                    return res.redirect('/');
                }
            } catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Something went wrong' });
            }
        }
    };
}

module.exports = orderController;
