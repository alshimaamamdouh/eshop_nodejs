const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { timestamps: true });


cartSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

cartSchema.set('toJSON', {
  virtuals: true,
});
module.exports = mongoose.model('Cart', cartSchema);