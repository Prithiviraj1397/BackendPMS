import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import { Role } from '../../models';
import { Irole, createRoleInput, Pagination, addPermission, updateRoleInput, IdeleteRole } from '../../interface/IRole';
import { validateAuthToken } from '../../middleware/jwt'
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status';

//Query Functions
const getAllrole = catchAsync(async (_: any, { Input }: { Input: Pagination }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        const { limit, index }: any = Input;
        const startIndex: any = (index - 1) * limit;
        const doc = await Role.find().sort({ _id: -1 }).limit(parseInt(limit)).skip(parseInt(startIndex));
        const count = await Role.find().countDocuments();
        return {
            total: count,
            page: index,
            pageSize: limit,
            data: doc
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized Request or Unable to create',)
    }
})

//Mutation Functions
const createRole = async (_: any, { Input }: { Input: createRoleInput }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        const { role }: any = Input;
        const roleExist = await Role.findOne({ role })
        if (roleExist) {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Role data already Exist!')
        }
        let { write, create, read } = Input.access;
        if (write && create) {
            Input.access.read = true
        }
        const newRole = await Role.create(Input);
        return {
            status: httpStatus.CREATED,
            message: 'Role data created successfully!',
            data: newRole
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized Request or Unable to create',)
    }
}

const addPermissionToRole = async (_: any, { Input }: { Input: addPermission }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        const { roleId, permission }: any = Input;
        const updateRole = await Role.updateOne(
            { _id: roleId },
            { $push: { permission } }
        )
        if (updateRole.modifiedCount) {
            return {
                status: httpStatus.CREATED,
                message: 'Permission added successfully!',
                data: await Role.findById(roleId)
            }
        } else {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Permission added failed!');
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized Request or Unable to create',)
    }
}

const removePermissionToRole = async (_: any, { Input }: { Input: addPermission }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        const { roleId, permission }: any = Input;
        const updateRole = await Role.updateOne(
            { _id: roleId },
            { $pull: { permission: { $in: permission } } }
        )
        if (updateRole.modifiedCount) {
            return {
                status: httpStatus.CREATED,
                message: 'Permission removed successfully!',
                data: await Role.findById(roleId)
            }
        } else {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Permission remove failed!');
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized Request or Unable to create',)
    }
}

const updateRole = async (_: any, { Input }: { Input: updateRoleInput }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        const { id }: any = Input;
        const updateRole = await Role.updateOne(
            { _id: id },
            { $set: { ...Input } }
        )
        if (updateRole.modifiedCount) {
            return {
                status: 201,
                message: 'Role updated successfully!',
                data: await Role.findById(id)
            }
        } else {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Role updated failed!');
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized Request or Unable to create',)
    }
}

const deleteRole = async (_: any, { Input }: { Input: IdeleteRole }, context: any) => {
    let { adminToken } = context.req.cookies;
    const tokenData: any = adminToken != undefined ? await validateAuthToken(adminToken) : false
    if (tokenData) {
        const { id } = Input;
        const deleteData = await Role.deleteOne({ _id: id });
        if (deleteData.deletedCount) {
            return {
                status: 200,
                message: 'Role deleted successfully'
            }
        } else {
            throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Role deleted failed!');
        }
    } else {
        throw graphqlErrorHandler(httpStatus.UNAUTHORIZED, 'Unauthorized Request or Unable to create',)
    }
}

export default {
    Query: {
        getAllrole
    },
    Mutation: {
        createRole,
        addPermissionToRole,
        removePermissionToRole,
        updateRole,
        deleteRole
    },
}