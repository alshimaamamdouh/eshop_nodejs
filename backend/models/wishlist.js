const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

wishlistSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

wishlistSchema.set('toJSON', {
  virtuals: true,
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
