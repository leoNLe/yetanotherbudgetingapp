/****************************************************************************************
 *                                    HISTORY                                           *
 ****************************************************************************************
 *                                                                                      *
 * == chikeobi-03 ==                                                                    *
 *   +  Added this History section                                                      *
 *                                                                                      *
 * == chikeobi-16 ==                                                                    *
 *   +  Added instance methods:                                                         *
 *     - "subCategoryCount" // returns number of subCategory subDocuments               *
 *     - "subCategoryIdNameMap" // returns key/value pair object of subCategory ID/Name *
 *     - "getSubCategoryById"   // returns subCategory subDocument by ID                *
 *   +                                                                                  *
 *                                                                                      *
 *                                                                                      *
 *                                                                                      *
 *                                                                                      *
 *                                                                                      *
 *                                                                                      *
 *                                                                                      *
 *                                                                                      *
 ****************************************************************************************
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//import { v4 as uuidv4 } from "uuid";
const { v4 } = require("uuid");
const uuidv4 = v4;
const Constants = require("../constants");

/**
 * Defines Collection that holds the Categories and subCategories for each user. This is a nested document at will have an
 * array of subdocuments
 * @see https://mongoosejs.com/docs/schematypes.html#arrays
 */
const SubCategorySchema = new Schema({
  _id: { type: Schema.Types.String, default: uuidv4 },
  subCategoryName: { type: Schema.Types.String, required: true },
});

const UserCategoryGroupSchema = new Schema({
  _id: { type: Schema.Types.String, default: uuidv4 },
  ownerRef: { type: Schema.Types.String, required: true, ref: "UserProfile" }, // points to te ID of the owner in the UserProfile collection
  categoryName: { type: Schema.Types.String, required: true },
  categoryName4Compare: { type: Schema.Types.String, required: true },
  subCategory: [SubCategorySchema],
  //  perspective: {
  //    // defines if transaction is INFLOW or OUTFLOW type
  //    type: Schema.Types.String,
  //    required: true,
  //    enum: Constants.ACCOUNT_PERSPECTIVES,
  //    default: Constants.DEFAULT_PERSPECTIVE,
  //  },
  access: {
    type: Schema.Types.String,
    enum: Constants.ACCOUNT_ACCESS_LEVELS,
    required: true,
    default: Constants.ACCOUNT_ACCESS_DEFAULT,
  },
});
/**
 * returns number of subCategory subDocuments
 */
UserCategoryGroupSchema.methods.getSubCategoryCount = function () {
  return this.subCategory.length;
};

/**
 * returns key/value pair object of subCategory ID/Name
 */
UserCategoryGroupSchema.methods.getSubCategoryIdNameMap = function () {
  let retval = {};
  for (let index = 0; index < this.subCategory.length; index++) {
    retval[this.subCategory[index]._id] = this.subCategory[
      index
    ].subCategoryName;
  }
  return retval;
};

/**
 * returns subCategory subDocument by ID
 */
UserCategoryGroupSchema.methods.getSubCategoryById = function (subId) {
  if (subId) {
    for (let index = 0; index < this.subCategory.length; index++) {
      if ([this.subCategory[index]._id] == subId)
        return this.subCategory[index];
    }
  }
  return;
};

const UserCategoryGroup = mongoose.model(
  "UserCategoryGroup",
  UserCategoryGroupSchema
);

module.exports = UserCategoryGroup;
