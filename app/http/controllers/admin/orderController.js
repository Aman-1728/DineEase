// const order = require("../../../models/order")

// const Order = require('../../../models/order')

// function orderController() {
//     return {
//         index(req, res) {
//            order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 }}).populate('customerId', '-password').exec((err, orders) => {
//                if(req.xhr) {
//                    return res.json(orders)
//                } else {
//                 return res.render('admin/orders')
//                }
//            })
//         }
//     }
// }

// module.exports = orderController

const order = require("../../../models/order");

function orderController() {
    return {
        async index(req, res) {
            try {
                const orders = await order
                    .find({ status: { $ne: 'completed' } })
                    .sort({ createdAt: -1 })
                    .populate('customerId', '-password')
                    .exec();

                if (req.xhr) {
                    return res.json(orders);
                } else {
                    return res.render('admin/orders', { orders });
                }
            } catch (err) {
                // Handle any potential errors
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
}

module.exports = orderController;
