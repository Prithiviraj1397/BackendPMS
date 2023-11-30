export default `

scalar DateScalar

type Auth {
    _id: ID!,
    username: String!
    email: String!
    password: String!
    role : String!
}

input createAuthInput{
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
    role : String!
}

type CreateAuthResponse{
    status: Int!
    message: String!
    data: Auth!
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

type AllAuthResponse{
    _id: ID!,
    username: String!
    email: String!
    password: String!
    role:String!
}
input Pagination{
    limit:Int!
    index:Int!
}

type LogoutResponse{
    status:Int!
    message:String!
}

input inviteUserWithMailInput{
    username:String!
    email:String!
    role:String!
    permission:[String]!
}

type Query{
    loginAuth(Input:LoginInput):LoginResponse
    logoutAuth:LogoutResponse
    getAllAuth(Input:Pagination):[AllAuthResponse]
}

type Mutation{
    createAuth(Input: createAuthInput!): CreateAuthResponse!
    inviteUserWithMail(Input:inviteUserWithMailInput):forgotPasswordResponse
}
`