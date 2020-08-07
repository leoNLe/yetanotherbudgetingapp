const db = require("../models");
const UserProfileController = require("./userProfileController");
const Constants = require("../constants");

// Define methods for the UserCategoryGroup controller

module.exports = {
  removeByOwnerId: async function (ownerRef) {
    if (ownerRef != null) {
      const result = await db.UserCategoryGroup.remove({ ownerRef: ownerRef });
      return result;
    }
    return null;
  },
  createDocument: async function (ownerRef, groupName, categories) {
    if (
      ownerRef == null ||
      groupName == null ||
      (groupName = groupName.trim()).length == 0 ||
      categories == null ||
      categories.length == 0
    ) {
      return null;
    }
    // get UserProfile by ownerRef
    const dbProfiles = await UserProfileController.findById(ownerRef);
    if (dbProfiles == null || dbProfiles.length != 1) {
      return null;
    }
    const dbProfile = dbProfiles[0];
  },

  InitializeUserCategoryGroup: async function (email) {
    try {
      let dbResults = await db.UserProfile.find({ email: email });
      //let dbResults = await UserProfileController.findByEmail(email);
      if (dbResults == null || dbResults.length != 1) {
        throw `*** ERROR *** Unale to find user profile for "${email}"`;
      }
      let dbProfile = dbResults[0];
      let retval = [];
      // Check if the profile as bee initialized. If not
      if (dbProfile.isProfileInitialized == false) {
        console.log(`\n\nAccount "${dbProfile.email}" has not been initialized`);
        let ownerRef = dbProfile._id;
        for (let index = 0; index < Constants.GENERIC_BUDGET_CATEGORIES.length; index++) {
          let generic = Constants.GENERIC_BUDGET_CATEGORIES[index];
          // let groupName = generic.groupName;
          // let perspective = generic.perspective || Constants.DEFAULT_PERSPECTIVE;
          // let infoData = { ownerRef: ownerRef, groupName: groupName };

          let categoryGroup = new db.UserCategoryGroup({
            ownerRef: ownerRef,
            groupName: generic.groupName,
            perspective: generic.perspective || Constants.DEFAULT_PERSPECTIVE,
          });
          for (let count = 0; count < generic.categories.length; count++) {
            let categoryName = generic.categories[count];
            categoryGroup.categories.push({ categoryName: categoryName });
          }

          // now save the document
          try {
            let catGrp = await categoryGroup.save();
            console.log("Saved document\n", catGrp);
            retval.push(catGrp);
          } catch (err) {
            console.log("\n\n**ERROR** Unable to save document:\n", generic);
          }
        }
      }
      if (retval.length != 0) {
        dbProfile.isProfileInitialized = true;
        let savedProfile = await dbProfile.save();
        console.log("\n\nSaved Profile:\n",savedProfile,"\n");
      }
      console.log(`\n\nSaved User Category for ${email}\n`,retval);
      return retval;
    } catch (error) {
      console.log(error.message);
    }
  },
};