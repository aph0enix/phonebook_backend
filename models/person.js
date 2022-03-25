const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
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

const checkPNum = n => { 
  const a = n.split('-')
  return (a.length === 2 && a[0].length < 4 && a[0].length > 1 && (a[0].length + a[1].length) > 7)
}

phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', phonebookSchema)