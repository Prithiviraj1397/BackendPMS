import { GraphQLError, GraphQLErrorOptions } from 'graphql';

export const graphqlErrorHandler = (status: number, message: string = ''): GraphQLError => {
    const errorOptions: GraphQLErrorOptions = {
        extensions: {
            status
        },
    };
    const error: GraphQLError = new GraphQLError(message, errorOptions);
    throw error;
};