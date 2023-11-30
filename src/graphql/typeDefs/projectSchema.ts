export default `
scalar DateScalar
scalar JSON
type Project{
    _id:ID!
    title: String,
    client: String,
    clientId:String,
    startDate: DateScalar,
    deadLine: DateScalar,
    progress:String,
    status:String
}

input DynamicInput {
    data: JSON
}

type PaginateProjectResponse{
    total: Int
    page: Int
    pageSize: Int
    data: [JSON]
}

type createProjectResponse{
    status:String
    message:String
}

type Query{
    getAllProject(Input:Pagination):PaginateProjectResponse
}
type Mutation{
    createProject(Input:DynamicInput):createProjectResponse
}

`