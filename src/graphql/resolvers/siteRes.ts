
import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import { Site } from '../../models';
import { createSiteInput } from '../../interface/ISite';
import { validateAuthToken } from '../../middleware/jwt';
import httpStatus from 'http-status';

const createSiteSetting = async (_: any, { Input }: { Input: createSiteInput }) => {
    const count = await Site.count();
    if (count == 0) {
        let site = await Site.create({ ...Input })
        return {
            status: httpStatus.OK,
            message: `site setting successfully created`,
            data: site
        }
    } else {
        throw graphqlErrorHandler(400, 'site setting already exists')
    }
}

const updateSiteSetting = async (_: any, { Input }: { Input: createSiteInput }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        const { id }: any = Input;
        const updateRole = await Site.updateOne(
            { _id: id },
            { $set: { ...Input } }
        );
        if (updateRole.modifiedCount) {
            return {
                status: 201,
                message: 'Role updated successfully!',
                data: await Site.findById(id)
            }
        } else {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Role updated failed!');
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized Request or Unable to create',)
    }

}

export default {
    Mutation: {
        createSiteSetting,
        updateSiteSetting
    },
}