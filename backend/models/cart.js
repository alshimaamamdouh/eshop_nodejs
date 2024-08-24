const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true, // Original price
      },
      discountedPrice: {
        type: Number,
        required: true, // Price after discount
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

cartSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

cartSchema.set('toJSON', {
  virtuals: true,
});

// Pre-save middleware to calculate total price using discounted prices
cartSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((acc, item) => {
    return acc + item.discountedPrice * item.quantity;
  }, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
