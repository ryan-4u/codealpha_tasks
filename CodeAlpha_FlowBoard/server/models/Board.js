const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  order: { type: Number, required: true }
});

const boardSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
  columns: {
    type: [columnSchema],
    default: [
      { id: "todo", title: "Todo", order: 0 },
      { id: "inprogress", title: "In Progress", order: 1 },
      { id: "inreview", title: "In Review", order: 2 },
      { id: "done", title: "Done", order: 3 }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model("Board", boardSchema);