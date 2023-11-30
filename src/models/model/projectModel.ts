import { model, Schema } from 'mongoose';
import { Iproject } from '../../interface/IProject';
import { graphqlErrorHandler } from '../../utils/graphqlErrorHandler';
import httpStatus from 'http-status'
import { Client } from '../index';

const clientEnumFunction = async (value: String) => {
    const ClientData = await Client.find();
    const ClientEnum: String[] = [];
    ClientData.map(item => {
        ClientEnum.push(item.firstName)
    })
    return ClientEnum.includes(value) ? true : false;
}

const projectSchema: Schema = new Schema({
    title: {
        type: String,
        required: true
    },
    client: {
        type: String,
        validate: async (value: any) => {
            let v: String = value;
            let check = await clientEnumFunction(v);
            if (!check) {
                throw graphqlErrorHandler(httpStatus.BAD_REQUEST, 'Please provide valid client')
            }
        },
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    startDate: {
        type: Date,
        required: true
    },
    deadLine: {
        type: Date,
        required: true
    },
    progress: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
}, { strict: false, timestamps: true, __v: 0 });

export default model<Iproject>("Project", projectSchema, "Project")