const mongoose = require('mongoose')
const argsLength = process.argv.length
if (argsLength < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}
const password = process.argv[2]
const dbName = 'phonebookApp'
const url =
  `mongodb+srv://aphoenix:${password}@fullstackopen.xpqbq.mongodb.net/${dbName}?retryWrites=true&w=majority`

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema(
  {
    name: String,
    number: String
  }
)
const Person = mongoose.model('Person', phonebookSchema)
if(argsLength === 3){
  console.log('phonebook:')
  Person
    .find({})
    .then(result => {
      result.forEach(person => {
        console.log(person.name, person.number)
      })
      mongoose.connection.close()
    })
}
if(argsLength === 5){
  const name = process.argv[3]
  const number = process.argv[4]
  const person = new Person({
    name,number
  })
  person.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}


