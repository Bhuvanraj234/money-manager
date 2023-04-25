module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        type: String,
        title: String,
        date: Date,
        amount: Number,
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Manager = mongoose.model("manager", schema);
    return Manager;
  };