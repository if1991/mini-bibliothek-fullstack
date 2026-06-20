import { GraphQLScalarType, Kind } from "graphql";
import { Types } from "mongoose";

export const ObjectIdScalar = new GraphQLScalarType({
  name: "ObjectId",
  description: "MongoDB ObjectId scalar type",

  parseValue(value: unknown) {
    if (typeof value === "string") {
      return new Types.ObjectId(value);
    }
    throw new Error("Invalid ObjectId input");
  },

  serialize(value: unknown) {
    if (typeof value === "string") return value;
    if (typeof value === "object" && value != null && "toString" in value) {
      return value.toString();
    }
    throw new Error("Unable to serialize ObjectId");
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Types.ObjectId(ast.value);
    }
    return null;
  },
});