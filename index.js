const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const _ = require('lodash/core');

const app = express()

app.use(cors())
app.use(express.json())
morgan.token('body', (req, res) => { 
  return (_.isEmpty(req.body) ? null : JSON.stringify(req.body)) 
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]
const base_route = '/api/persons'
app.get(base_route, (_, response)=>{
  response.json(persons)
})

const generateId = ()=>{
  return Math.floor(1000000 * Math.random())
}

app.post(base_route, (request,response)=>{
  const body = request.body
  let missing = []
  const name = body.name, number = body.number
  if(!name){
    missing.push("name")
  } 
  if(!number){
    missing.push("number")
  } 
  if(missing.length > 0){
    return response.status(400).json({error: `Missing parameters: ${missing.join(' and ')}`})
  }
  if (persons.map(p=>p.name).includes(name)){
    return response.status(400).json({error: `This person '${name}' already exists in the phonebook, names must be unique`})
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }
  persons = persons.concat(person)
  response.json(person)
})

app.get('/api/persons/:id', (request, response)=>{
  const id = Number(request.params.id)
  const person = persons.find(p=> p.id === id)
  if(person){
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.get('/info', (_, response)=>{
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`
    )
})

app.delete('/api/persons/:id', (request,response)=>{
  const id = Number(request.params.id)
  persons = persons.filter(p=> p.id != id)
  response.status(204).end()
})



const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

