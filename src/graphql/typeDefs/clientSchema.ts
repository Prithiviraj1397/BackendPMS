export default `
type Client{
    _id:ID!
    firstName: String
    lastName: String
    email: String
    password: String
    phone: String
    currency: String
    country: String
    groups: String
    label: String
    address: String
    access:[String]
}
input createClientInput{
    firstName: String
    lastName: String
    email: String
    phone: String
    currency: String
    country: String
    groups: String
    label: String
    address: String
    access:[String]
}
type createClientResponse{
    status:String
    message:String
}

type Query{
    loginClient(Input:LoginInput):LoginResponse
    logoutClient:LogoutResponse
    getAllClient:[Client]
    resetClientLink(Input: forgotPasswordUserInput!):forgotPasswordResponse
}

type Mutation{
    createClient(Input:createClientInput):createClientResponse
}

`