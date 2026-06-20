import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

export const userResolvers = {
  Query: {
    meMitLookups: async (
      _: unknown,
      __: unknown,
      context: any
    ) => {
      if (!context.userId) {
        return null;
      }

      const result = await User.aggregate([
        {
          $match: {
            _id: new ObjectId(context.userId),
          },
        },
        {
          $lookup: {
            from: "buches",
            localField: "persoenlicheListe",
            foreignField: "_id",
            as: "persoenlicheListe",
          },
        },
        {
          $unwind: {
            path: "$persoenlicheListe",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "autors",
            localField: "persoenlicheListe.autor",
            foreignField: "_id",
            as: "persoenlicheListe.lookupAutor",
            pipeline: [
              {
                $lookup: {
                  from: "buches",
                  localField: "_id",
                  foreignField: "autor",
                  as: "buecher",
                },
              },
            ],
          },
        },
        {
          $set: {
            "persoenlicheListe.lookupAutor": {
              $first:
                "$persoenlicheListe.lookupAutor",
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            name: {
              $first: "$name",
            },
            vorname: {
              $first: "$vorname",
            },
            email: {
              $first: "$email",
            },
            rolle: {
              $first: {
                $ifNull: ["$rolle", "USER"],
              },
            },
            persoenlicheListe: {
              $push: "$persoenlicheListe",
            },
          },
        },
      ]);

      return result[0] || null;
    },
  },

  Mutation: {
    registrieren: async (
      _: unknown,
      {
        name,
        vorname,
        email,
        password,
      }: {
        name: string;
        vorname: string;
        email: string;
        password: string;
      }
    ) => {
      const hashedPassword =
        await bcrypt.hash(password, 10);

      const user = new User({
        name,
        vorname,
        email,
        password: hashedPassword,
        rolle: "USER",
      });

      return await user.save();
    },

    einloggen: async (
      _: unknown,
      {
        email,
        password,
      }: {
        email: string;
        password: string;
      }
    ) => {
      const result = await User.aggregate([
        {
          $match: {
            email,
          },
        },
        {
          $lookup: {
            from: "buches",
            localField: "persoenlicheListe",
            foreignField: "_id",
            as: "persoenlicheListe",
          },
        },
        {
          $unwind: {
            path: "$persoenlicheListe",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "autors",
            localField: "persoenlicheListe.autor",
            foreignField: "_id",
            as: "persoenlicheListe.lookupAutor",
          },
        },
        {
          $set: {
            "persoenlicheListe.lookupAutor": {
              $first:
                "$persoenlicheListe.lookupAutor",
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            name: {
              $first: "$name",
            },
            vorname: {
              $first: "$vorname",
            },
            email: {
              $first: "$email",
            },
            password: {
              $first: "$password",
            },
            rolle: {
              $first: {
                $ifNull: ["$rolle", "USER"],
              },
            },
            persoenlicheListe: {
              $push: "$persoenlicheListe",
            },
          },
        },
      ]);

      const user = result[0];

      if (!user) {
        throw new Error(
          "Benutzer nicht gefunden"
        );
      }

      const passwortIstGueltig =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwortIstGueltig) {
        throw new Error("Falsches Passwort");
      }

      /*
       * Das Secret wird erst beim Login gelesen.
       * Zu diesem Zeitpunkt wurde dotenv bereits geladen.
       */
      const jwtSecret =
        process.env.JWT_SECRET;

      if (!jwtSecret) {
        throw new Error(
          "JWT_SECRET wurde im Backend nicht konfiguriert."
        );
      }

      const rolle =
        user.rolle === "ADMIN"
          ? "ADMIN"
          : "USER";

      user.rolle = rolle;

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          rolle,
        },
        jwtSecret,
        {
          expiresIn: "1d",
        }
      );

      delete user.password;

      return {
        token,
        user,
      };
    },

    buchZuFavoritenHinzufuegen: async (
      _: unknown,
      {
        buchId,
      }: {
        buchId: string;
      },
      context: any
    ) => {
      if (!context.userId) {
        throw new Error(
          "Nicht autorisiert"
        );
      }

      await User.findByIdAndUpdate(
        context.userId,
        {
          $addToSet: {
            persoenlicheListe: buchId,
          },
        },
        {
          new: true,
        }
      );

      const result = await User.aggregate([
        {
          $match: {
            _id: new ObjectId(
              context.userId
            ),
          },
        },
        {
          $lookup: {
            from: "buches",
            localField: "persoenlicheListe",
            foreignField: "_id",
            as: "persoenlicheListe",
          },
        },
        {
          $unwind: {
            path: "$persoenlicheListe",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "autors",
            localField: "persoenlicheListe.autor",
            foreignField: "_id",
            as: "persoenlicheListe.lookupAutor",
          },
        },
        {
          $set: {
            "persoenlicheListe.lookupAutor": {
              $first:
                "$persoenlicheListe.lookupAutor",
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            name: {
              $first: "$name",
            },
            vorname: {
              $first: "$vorname",
            },
            email: {
              $first: "$email",
            },
            rolle: {
              $first: {
                $ifNull: ["$rolle", "USER"],
              },
            },
            persoenlicheListe: {
              $push: "$persoenlicheListe",
            },
          },
        },
      ]);

      const user = result[0];

      if (!user) {
        throw new Error(
          "User nach Update nicht gefunden"
        );
      }

      return {
        message: "Buch hinzugefügt",
        user,
      };
    },

    buchAusFavoritenEntfernen: async (
      _: unknown,
      {
        buchId,
      }: {
        buchId: string;
      },
      context: any
    ) => {
      if (!context.userId) {
        throw new Error(
          "Nicht autorisiert"
        );
      }

      if (!ObjectId.isValid(buchId)) {
        throw new Error(
          "Ungültige Buch-ID"
        );
      }

      await User.findByIdAndUpdate(
        context.userId,
        {
          $pull: {
            persoenlicheListe: buchId,
          },
        }
      );

      const result = await User.aggregate([
        {
          $match: {
            _id: new ObjectId(
              context.userId
            ),
          },
        },
        {
          $lookup: {
            from: "buches",
            localField: "persoenlicheListe",
            foreignField: "_id",
            as: "persoenlicheListe",
          },
        },
        {
          $unwind: {
            path: "$persoenlicheListe",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "autors",
            localField: "persoenlicheListe.autor",
            foreignField: "_id",
            as: "persoenlicheListe.lookupAutor",
          },
        },
        {
          $set: {
            "persoenlicheListe.lookupAutor": {
              $first:
                "$persoenlicheListe.lookupAutor",
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            name: {
              $first: "$name",
            },
            vorname: {
              $first: "$vorname",
            },
            email: {
              $first: "$email",
            },
            rolle: {
              $first: {
                $ifNull: ["$rolle", "USER"],
              },
            },
            persoenlicheListe: {
              $push: "$persoenlicheListe",
            },
          },
        },
      ]);

      const user = result[0];

      if (!user) {
        throw new Error(
          "User nach Entfernen nicht gefunden"
        );
      }

      return {
        message: "Buch entfernt",
        user,
      };
    },
  },
};

