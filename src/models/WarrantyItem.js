const mongoose = require("mongoose");

const warrantySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    vendor: {
      type: String,
      trim: true,
    },
    warrantyPeriodMonths: {
      type: Number, 
    },
    notes: {
      type: String,
      trim: true,
    },
    images: [{ 
        path: String,         
        originalName: String,  
        customName: String,    
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports= mongoose.model("Warranty", warrantySchema);
