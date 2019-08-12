const { ApolloServer, gql } = require('apollo-server')
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
    name: String!
    books: [Book!]!
  }
`

const resolvers = {
  Query: {
    hello: () => "world",
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let result;
      if(args.author) result = books.filter( book => book.author === args.author )
      if(args.genre) return result.filter(b => b.genres.includes(args.genre))
    },
    allAuthors: () => authors
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({url}) => {
  console.log(`Server ready at ${url}`)
})