export default `
type Site{
    _id:ID!
    site: String!
    siteName: String!
    siteUrl: String!
    phone: String!
    address: String!
}
input createSiteInput{
    site: String!
    siteName: String!
    siteUrl: String!
    phone: String!
    address: String!
}

type createSiteInputResponse{
    status:Boolean!
    message:String!
    data:Site
}

input updateSiteInput{
    id:ID!
    site: String
    siteName: String
    siteUrl: String
    phone: String
    address: String
}

type updateSiteResponse{
    status:String!
    message:String!
    data:Site
}

type Mutation{
    createSiteSetting(Input:createSiteInput!):createSiteInputResponse,
    updateSiteSetting(Input:updateSiteInput):updateSiteResponse
}
`
