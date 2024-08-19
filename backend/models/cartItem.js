const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { timestamps: true });


cartItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

cartItemSchema.set('toJSON', {
  virtuals: true,
});
module.exports = mongoose.model('CartItem', cartItemSchema);
