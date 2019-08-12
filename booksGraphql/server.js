const { ApolloServer, gql, UserInputError } = require('apollo-server')
const uuid = require('uuid/v1')

let { authors, books } = require('./data')

const typeDefs = gql`
  type Query {
    hello: String!,
    bookCount: Int!,
    authorCount: Int!,
    allBooks(author: String, genre: String): [Book],
    allAuthors: [Author!]!
  }

  type Book {
    title: String!
    author: String!
    published: Int!
    genres: [String!]
    id: ID!
  }

  type Author {
    id: ID!
    name: String
    bookCount: Int
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
  }
`

const resolvers = {
  Query: {
    hello: () => "world",
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let result = books;
      if(args.author) result = books.filter( book => book.author === args.author )
      if(args.genre) return result.filter(b => b.genres.includes(args.genre))

      return books
    },

    allAuthors: () => {
      authors.map(a => {
        let bookCount = books.filter(book => book.author === a.name)
        a.bookCount = bookCount.length
      })
      return authors
    }
  },

  Mutation: {
    addBook: (root, args) => {
      // Check if the book was already added
      if(books.find(b => b.title === args.title)) {
        throw new UserInputError('This book already exists!', {
          invalidArgs: args.name
        })
      }

      const authorExists = authors.find(a => a.name === args.author)

      if(!authorExists) {
        authors = authors.concat({
          name: args.author,
          id: uuid
        })
      }

      const book = {...args, id: uuid() }
      books = books.concat(book)

      return book
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({url}) => {
  console.log(`Server ready at ${url}`)
})