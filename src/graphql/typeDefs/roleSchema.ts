export default `

scalar DateScalar

type Role {
    _id: ID!,
    role: String!
    access: Access!
    permission:[String]
    createdAt:DateScalar
    updatedAt:DateScalar
}

type Access{
    read:Boolean
    write:Boolean
    create:Boolean
}

input AccessInput{
    read:Boolean
    write:Boolean
    create:Boolean
}
input createRoleInput{
    role: String!
    access: AccessInput
    permission:[String]
}

type CreateRoleResponse{
    status: Int!
    message: String!
    data: Role
}

input Pagination{
    limit:Int
    index:Int
}

input PermissionInput{
    roleId:String!
    permission:[String]
}

type PermissionResponse{
    status: Int!
    message: String!
    data: Role
}

input deleteInput{
    id:ID!
}

type deleteInputResponse{
    status: Int!
    message: String!
}

type PaginateRoleResponse{
    total: Int
    page: Int
    pageSize: Int,
    data: [Role]
}

input updateRoleInput{
    id:ID!
    role: String
    access: AccessInput
    permission:[String]
}

type updateRoleResponse{
    status:String!
    message:String!
    data:Role
}

type Query{
    getAllrole(Input:Pagination!):PaginateRoleResponse
}

type Mutation{
    createRole(Input: createRoleInput!): CreateRoleResponse!
    addPermissionToRole(Input:PermissionInput):PermissionResponse!
    removePermissionToRole(Input:PermissionInput):PermissionResponse!
    updateRole(Input:updateRoleInput):updateRoleResponse
    deleteRole(Input:deleteInput):deleteInputResponse!
}
`