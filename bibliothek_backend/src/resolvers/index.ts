import { autorResolvers } from "./autorResolvers";

export const resolvers = {
  Query: {
    ...autorResolvers.Query,
  },
};
