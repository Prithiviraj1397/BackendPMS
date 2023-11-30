import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import { Iproject, Pagination } from "../../interface/IProject"
import { createToken, validateAuthToken, accessTokenCookieOptions, cookieOptions } from '../../middleware/jwt';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { Project, Client } from '../../models';
import Validator from 'validator';
import { logger } from '../../config/logger'

//Query Functions
const getAllProject = async (_: any, { Input }: { Input: Pagination }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        const { limit, index }: any = Input;
        const doc: any = await Project.aggregate([
            {
                $facet: {
                    metadata: [{ $count: 'totalCount' }],
                    data: [{ $skip: (index - 1) * limit }, { $limit: limit }],
                },
            },
            {
                $sort: { _id: -1 }
            }
        ]);
        return {
            total: doc[0].metadata[0] && doc[0].metadata[0].totalCount ? doc[0].metadata[0].totalCount : 0,
            page: index,
            pageSize: limit,
            data: doc[0].data
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized request')
    }
}

//Mutation Functions
const createProject = async (_: any, { Input }: { Input: any }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        let { client }: any = Input.data;
        const clientData = await Client.findOne({ firstName: client });
        if (!clientData) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Client Does not Exists')
        }
        Input.clientId = client._id;
        await Project.create({ ...Input.data })
        return {
            status: httpStatus.OK,
            message: `Project has been created successfully`
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized request')
    }
}

export default {
    Query: {
        getAllProject
    },
    Mutation: {
        createProject
    }
}