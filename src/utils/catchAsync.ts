import { graphqlErrorHandler } from '../utils/graphqlErrorHandler';
import httpStatus from 'http-status';
type ResolverArgs = [any, any, any, any];
const catchAsync = (resolverFn: (...args: ResolverArgs) => Promise<any>) => async (...args: ResolverArgs) => {
  try {
    return await resolverFn(...args);
  } catch (error) {
    console.log("🚀 ~ file: catchAsync.ts:24 ~ catchAsync ~ error:", error)
    throw graphqlErrorHandler(httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong")
  }
};

export default catchAsync;
