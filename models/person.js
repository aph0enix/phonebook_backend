const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url)
  // eslint-disable-next-line no-unused-vars
  .then(_result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const phonebookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength:3,
      required:true,
      unique: true

    },
    number: {
      type: String,
      minlength: 8,
      validate: {
        validator: v => /^((\d+)|(\d{2}-\d{6,})|(\d{3}-\d{5,}))$/.test(v),
        message: props => `${props.value} is not a valid phone number`
      }
    }
  }
)

phonebookSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', phonebookSchema)