const {User} = require('../models/userModel');
const {Order}=require('../models/ordermodel')
const Cart = require('../models/cartmodel')
const  Banner=require('../models/bannermodel')
const dotenv = require('dotenv');
const PDFDocument = require('pdfkit');
dotenv.config();



   
const calculateTotalAmount = (cartItems) => {
    if (!cartItems || cartItems.length === 0) {
        return 0;
    }
    let totalSum = 0;
    cartItems.forEach((item) => {
        const originalPrice = item.ProductId.productPrice;
        const offerPrice = item.ProductId.offerPrice || originalPrice;

        totalSum += offerPrice * item.Quantity;
    });
    return totalSum;
};






    const order = async (req, res) => {
        try {
            const userId = req.session.user;
            const cartItems = await Cart.find({ UserId: userId }).populate('ProductId').lean();
            const selectedAddressId = req.body.selectedAddressId; 
            const user = await User.findById(userId);
            
            const selectedAddress = user.Address.find(addr => addr._id.toString() === selectedAddressId);
            
            if (!selectedAddress) {
                return res.status(400).send('Selected address not found.');
            }
            
            const products = cartItems.map((cartItem) => ({
                productId: cartItem.ProductId._id,
                productName: cartItem.ProductId.productName,
                productPrice: cartItem.ProductId.productPrice,
                quantity: cartItem.Quantity,
            }));
    
            const totalSum = calculateTotalAmount(cartItems);
    
            let discountedTotal;
            if (req.session.discountedTotal && req.session.discountedTotal > 0) {
                discountedTotal = req.session.discountedTotal;
            } else {
                discountedTotal = totalSum;
            }
            const newOrderId=generateOrderId('USR');
            const newOrder = new Order({
                orderId:newOrderId,
                userId: userId,
                products: products,
                address: selectedAddress, 
                total: discountedTotal,
                paymentMethod: req.body.paymentMethod,
            });
    
            await newOrder.save();
            await Cart.deleteMany({ UserId: userId });
            res.status(200).send('Order placed successfully');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error placing the order');
        }
    };
    
      


    function generateOrderId(prefix) {
        const timestamp = Date.now().toString(36);
        const randomString = Math.random().toString(36).substr(2, 5); 
        return `${prefix}-${timestamp}-${randomString}`;
    }





    const formatProductPrice = (product, cartItems) => {
        const originalPrice = product.productPrice
        const totalSum = calculateTotalAmount(cartItems);
        const offerPrice = product.offerPrice || originalPrice;
        return offerPrice;
    };



    
    const getOrder = async (req, res) => {
        const userId = req.session.user;
        try {
            const user = await User.findById(userId);
            const orders = await Order.find({ userId: userId }).lean();
            const cartItems = await Cart.find({ userId: userId });
            const discountApplied=req.session.discountedTotal > 0
            res.render('user/myorder', { orders, wallet: user.wallet, formatProductPrice, cartItems,discountApplied });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching orders');
        }
    };
    
    
    
      
      

    const cancelOrder = async (req, res) => {
        const orderId = req.params.orderId;
        const cancellationReason = req.body.cancellationReason;
    
        try {
            const order = await Order.findById(orderId);
    
            if (!order || order.cancelled) {
                return res.status(400).json({ error: 'Order is already cancelled or not found' });
            }
    
            const userId = req.session.user;
            const user = await User.findById(userId);
    
            order.cancelled = true;
            order.cancellation = new Date();
            order.returnExpiry = new Date(order.cancellation.getTime() + 4 * 24 * 60 * 60 * 1000);
            order.cancellationReason = cancellationReason;
    
            if (order.paymentMethod === 'Razorpay') {

                user.wallet += order.total;
                await user.save();
            }
            await order.save();
    
            if (order.paymentMethod === 'Razorpay') {
                const updatedWalletAmount = user.wallet.toFixed(2);
                return res.status(200).json({
                    message: 'Amount credited to wallet',
                    walletAmount: updatedWalletAmount,
                    cancellationReason: order.cancellationReason,
                });
            } else {
                return res.status(200).json({
                    message: 'Order cancelled successfully',
                    cancellationReason: order.cancellationReason,
                });
            }
        } catch (error) {
            console.error('Error cancelling the order:', error);
            return res.status(500).json({ error: 'Error cancelling the order' });
        }
    };
    
    
 

    const downloadInvoice = async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const order = await Order.findById(orderId).populate('products.productId').lean();
            const user = await User.findById(order.userId).lean();
            res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
            res.setHeader('Content-Type', 'application/pdf');
    
            const doc = new PDFDocument();
            doc.pipe(res);
            doc.fontSize(18).text(`Invoice for your order`, { align: 'center' }).moveDown(0.5);
            doc.fontSize(14).text(`Order Date: ${order.date.toLocaleDateString()}`, { align: 'left' }).moveDown(0.5);
            doc.fontSize(14).text(`Customer Name: ${user.name}`, { align: 'left' }).moveDown(0.5);
            doc.fontSize(16).text('Address:', { align: 'left' }).moveDown(0.5);
            doc.fontSize(12).text(`Name: ${order.address[0].name}`);
            doc.fontSize(12).text(`Number: ${order.address[0].number}`);
            doc.fontSize(12).text(`House: ${order.address[0].house}`);
            doc.fontSize(12).text(`City: ${order.address[0].city}`);
            doc.fontSize(12).text(`State: ${order.address[0].state}`);
            doc.fontSize(12).text(`Pincode: ${order.address[0].pincode}`);
            doc.fontSize(12).text(`Delivery Point: ${order.address[0].delivery_point}`);
            doc.moveDown(0.5);

            doc.fontSize(16).text('Product Details:', { align: 'left' }).moveDown(0.5);
            order.products.forEach((product) => {
                doc.fontSize(12).text(`Product Name: ${product.productId.productName}`);
                doc.fontSize(12).text(`Price: ${product.productId.productPrice.toFixed(2)}`);
                doc.fontSize(12).text(`Quantity: ${product.quantity}`);
                doc.fontSize(12).text(`Total: ${(product.quantity * product.productId.productPrice).toFixed(2)}`);
                doc.moveDown(0.5);
            });
            doc.end();
        } catch (error) {
            console.error(error);
            res.status(500).send('Error generating or downloading the invoice');
        }
    };

    module.exports = {
        order,
        getOrder,
        cancelOrder,
        downloadInvoice
    }