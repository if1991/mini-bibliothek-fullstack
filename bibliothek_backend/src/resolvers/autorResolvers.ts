import Autor from "../models/Autor";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';

export const autorResolvers = {
  Query: {
    alleAutoren: async () => {
      try {
        const autoren = await Autor.aggregate([
          {
            $lookup: {
              from: "buches", 
              localField: "_id",
              foreignField: "autor",
              as: "buecher",
            },
          },
        ]);
        return autoren;
      } catch (err) {
        console.error("Fehler beim Lookup der Autoren:", err);
        return [];
      }
    },

    gibEinAutor: async (_: any, { id }: { id: string }) => {
      try {
        const autor = await Autor.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(id) } },
          {
            $lookup: {
              from: "buches",
              localField: "_id",
              foreignField: "autor",
              as: "buecher",
            },
          },
        ]);
        return autor[0] || null;
      } catch (err) {
        console.error("Fehler bei gibEinAutor:", err);
        return null;
      }
    },
  },

  Mutation: {},
};