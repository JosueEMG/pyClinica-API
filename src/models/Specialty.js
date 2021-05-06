const { Schema, model } = require("mongoose");

const specialtySchema = new Schema(
  {
    name: { type: String },
    price: { type: Number },
    doctors: [
      {
        type: Schema.Types.ObjectId,
        ref: "doctor",
      },
    ],
    campus: { type: Schema.Types.ObjectId, ref: "campus" },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model("specialty", specialtySchema);
