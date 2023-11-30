export default `

scalar DateScalar

type User {
    _id: ID!,
    username: String!
    email: String!
    password: String!
    role: String!
    createdAt:DateScalar
    updatedAt:DateScalar
}

input createUserInput{
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
}

type CreateUserResponse{
    status: Int!
    message: String!
}

input LoginInput{
    email:String!
    password:String!
}

type LoginResponse{
    status:Int!
    message:String!
    token:String
}

type AllUserData{
    _id: ID!,
    username: String!
    email: String!
    password: String!
    role: String!
}

type forgotPasswordResponse{
    status:Boolean
    message:String
}

input forgotPasswordUserInput{
    email:String!
}

type Query{
    getAllUser: [AllUserData]
    getSingleUser(id:ID!): [AllUserData]
    loginUser(Input:LoginInput):LoginResponse
    loginWithGoogle:String
    logoutUser:LogoutResponse
}

type Mutation{
    createUser(Input: createUserInput!): CreateUserResponse!
    forgotPassword(Input: forgotPasswordUserInput!):forgotPasswordResponse
    deleteUser(Input:deleteInput!):deleteInputResponse!
    inviteUser(Input: forgotPasswordUserInput!):forgotPasswordResponse
}
`