const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true }, 
  orderItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discountedPrice: { type: Number },
  }],
  shippingAddress1: { type: String, required: true },
  shippingAddress2: { type: String },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: 'Pending', required: true },
  totalPrice: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateOrdered: { type: Date, default: Date.now },
}, { timestamps: true });

orderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

orderSchema.set('toJSON', {
  virtuals: true,
});

// Pre-saving to generate orderNumber starts with #
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    const randomFourDigits = Math.floor(1000 + Math.random() * 9000); // number between 1000 and 9999
    this.orderNumber = `#${randomFourDigits}`; // adding #
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
