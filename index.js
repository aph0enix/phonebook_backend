require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const _ = require('lodash/core')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
// eslint-disable-next-line no-unused-vars
morgan.token('body', (req, _res) => {
  return (_.isEmpty(req.body) ? null : JSON.stringify(req.body))
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))



const baseRoute = '/api/persons'
app.get(baseRoute, (_, response) => {
  Person.find({}).then(persons => response.json(persons))
})

// const generateId = ()=>{
//   return Math.floor(1000000 * Math.random())
// }

app.post(baseRoute, (request,response, next) => {
  const body = request.body
  let missing = []
  const name = body.name, number = body.number
  if(!name){
    missing.push('name')
  }
  if(!number){
    missing.push('number')
  }
  if(missing.length > 0){
    return response.status(400).json({ error: `Missing parameter(s): ${missing.join(' and ')}` })
  }
  // if (persons.map(p=>p.name).includes(name)){
  //   return response.status(400).json({error: `This person '' already exists in the phonebook, names must be unique`})
  // }
  const person = new Person({
    name,number
  })
  person.save().then(savedPerson => {
    console.log(`added ${savedPerson.name} number ${savedPerson.number} to phonebook`)
    response.json(savedPerson)
  }).catch(error => next(error))

})

app.get(`${baseRoute}/:id`, (request, response, next) => {
  const id = request.params.id
  Person.findById(id).then(requestedPerson => {
    if(requestedPerson){
      response.json(requestedPerson)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))

})

app.get('/info', (_, response) => {
  Person.countDocuments({}).then(personsLength => {
    response.send(
      `<p>Phonebook has info for ${personsLength} people</p>
      <p>${new Date()}</p>`
    )
  })

})

app.put(`${baseRoute}/:id`, (request, reponse, next) => {
  const id = request.params.id
  const name = request.body.name, number = request.body.number
  const person = { name, number }
  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      reponse.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete(`${baseRoute}/:id`, (request,response, next) => {
  const id = request.params.id
  Person.findByIdAndRemove(id)
    .then(removedPerson => {
      if(_.isEmpty(removedPerson)){
        response.status(404).end()
      } else {
        response.status(204).end()
      }
    })
    .catch(error => next(error))
})

//At the end of routes; handle unknown routes:
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

//At the very end; handle errors by an error middleware:
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

