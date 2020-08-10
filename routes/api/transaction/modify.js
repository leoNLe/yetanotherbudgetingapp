/****************************************************************************************
 *                                    HISTORY                                           *
 ****************************************************************************************
 *                                                                                      *
 * == chikeobi-08 ==                                                                    *
 *   +    Added this History section                                                    *
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

/**
 * @see https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
 * @see https://codeforgeek.com/expressjs-router-tutorial/
 */

const crypto = require("crypto");
const router = require("express").Router();
const db = require("../../../models");
const Utilities = require("../../../utilities");
const Constants = require("../../../constants");
const TransactionController = require("../../../controllers/transactionController");
const AccountController = require("../../../controllers/budgetAccountController");

/**
 * Matches routes with /api/transaction/modify
 *
 * Success will return the following object:
 *
 *  - status: OK
 *  - message : "Transaction Modified"
 *  - transaction { }
 *  - account { }
 *  - manualAdjustment
 *
 *
 * Error will return:
 *  - status : ERROR
 *  - message : <Error message>
 *
 * Expects:
 *  - sessionUUID
 *  - transactionUUID
 *  - subCategoryUUID // optional. To change the category/subcategory of the transaction
 *  - payee // optional
 *  - date // optional yyyyMMdd format. If invalid or outside 20000101-20501231 it will be ignored
 *  - amount // optional. Sign based on perspective of category. If the amount changes,
 *           //the account balance will be adjusted between the old and new values
 *  - memo // optional. To remove existing memo, send string with at least one space.
 */
router.route("/").post((req, res) => {
  console.log(Utilities.getFullUrl(req));
  console.log(req.body);
  let response,
    dbProfile,
    ownerRef,
    dbAccount,
    accountUUID,
    dbResults,
    dbCategory,
    dbSubCategory,
    dbXaction,
    query,
    xactionModel,
    perspective,
    previousAmount,
    dbXactionUpdated = false,
    categoryUUID,
    manualAdjustmentCategoryName,
    dbManualAdjustmentCategory,
    dbManualAdjustmentCategoryUUID,
    dbManualAdjustmentSubCategoryUUID,
    previousSubCategoryUUID,
    transactionLog,
    amountUpdated = false,
    manualAdjustment = 0.0;

  let { sessionUUID, transactionUUID, subCategoryUUID, payee, date, amount, memo } = req.body;

  if (amount && isNaN(amount) == true) amount = undefined;

  if (!sessionUUID || (sessionUUID = sessionUUID.trim()).length == 0)
    response = { status: "ERROR", message: "Missing or invalid sessionUUID" };
  else if (!transactionUUID || (transactionUUID = transactionUUID.trim()).length == 0)
    response = { status: "ERROR", message: "Missing or invalid transactionUUID" };
  // make sure there is something to modify before we hit the database
  else if (
    (!subCategoryUUID || (subCategoryUUID = subCategoryUUID.trim()).length == 0) &&
    (!payee || (payee = payee.trim()).length == 0) &&
    (!date ||
      (date = date.trim()).length == 0 ||
      isNaN(date) == true ||
      (date = parseInt(date)) < Constants.MIN_YYYYMMDD ||
      date > Constants.MAX_YYYYMMDD) &&
    !amount &&
    !memo
  )
    response = { status: "ERROR", message: "Empty or invalid paramter(s) for update" };

  if (response) {
    console.log("Update/Modify Transaction API Response:\n", response);
    res.json(response);
    return;
  }
  if (memo) memo.trim();
  response = { status: "UNKNOWN", message: "" };
  (async () => {
    if (process.env.YET_DEBUG) {
      transactionLog = "\n\n*************** TRANSACTION LOGGER START *********************\n\n";
    }
    dbResults = await db.UserProfile.find({ sessionUUID }).lean(); // use "lean" because we just want "_id"; no virtuals, etc
    if (!dbResults || dbResults.length == 0) response = { status: "ERROR", message: "Invalid sessionUUID" };
    else {
      dbProfile = dbResults[0];
      ownerRef = dbProfile._id;
      dbResults = await db.Transaction.find({ _id: transactionUUID }).populate("categoryRef").populate("accountRef");
      if (!dbResults || dbResults.length == 0) response = { status: "ERROR", message: "Invalid transactionUUID" };
      else if (!(dbXaction = dbResults[0]).categoryRef._id || !dbXaction.subCategoryRef) {
        if (process.env.YET_DEBUG) {
          /* ********************** DEBUG **************************** */
          console.log("\n\nTansaction from Database:\n", JSON.stringify(dbXaction, null, 2));
          /* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
        }
        response = { status: "ERROR", message: "Unable to resolve Transaction Category/SubCategory" };
      } else {
        previousSubCategoryUUID = dbXaction.subCategoryRef;
        perspective = dbXaction.categoryRef.perspective;
        if (process.env.YET_DEBUG) {
          /* ********************** DEBUG **************************** */
          transactionLog += "\n\n**** Old Transaction ****\n" + TransactionController.getJSON(dbXaction);
          console.log("\n\nTansaction from Database:\n", JSON.stringify(dbXaction, null, 2));
          /* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
        }
        dbAccount = dbXaction.accountRef;
        accountUUID = dbAccount._id;
        // if the user entered subCategoryUUID and it is the same with the UUID that came back from the database,
        // then we don't have to change it
        if (subCategoryUUID == dbXaction.subCategoryRef) {
          if (process.env.YET_DEBUG) {
            /* ********************** DEBUG **************************** */
            let debug = `\nTransaction SubCategoryUUID (${dbXaction.subCategoryRef})`;
            debug += `\nis the same as parameter subCategoryUUID (${subCategoryUUID}).`;
            debug += "\nNo need to change Category/SubCategory";
            console.log(debug);
            /* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
          }
          subCategoryUUID = undefined;
        }
        // if subCategory is defined to be changed, find it
        if (
          subCategoryUUID &&
          !(dbCategory = await db.UserCategoryGroup.findOne({ "subCategory._id": subCategoryUUID }))
        )
          response = { status: "ERROR", message: `Unable to resolve SubCategory UUID (${subCategoryUUID})` };
        else {
          response.status = "OK";
          dbSubCategory = dbCategory.subCategory.id(subCategoryUUID);
          perspective = dbCategory.perspective;
          categoryUUID = dbCategory._id;
          if (process.env.YET_DEBUG) {
            /* ********************** DEBUG **************************** */
            console.log("\n\n****** Budget Account ******\n", JSON.stringify(dbAccount, null, 2));
            console.log("\n\n****** Transaction ******\n", JSON.stringify(dbXaction, null, 2));
            console.log("\n\n****** Original Category ******\n", JSON.stringify(dbCategory));
            console.log("\n\n****** Original SubCategory ******\n", JSON.stringify(dbSubCategory));
            /* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
          }
          if (!(previousAmount = dbXaction.amount)) previousAmount = 0.0;
          // change the values
          if (payee != dbXaction.payee) {
            dbXaction.payee = payee;
            dbXactionUpdated = true;
          }
          if (date && isNaN(date) == false) {
            date = parseInt(date);
            if (date >= Constants.MIN_YYYYMMDD && date <= Constants.MAX_YYYYMMDD && date != dbXaction.date) {
              if (process.env.YET_DEBUG) {
                transactionLog += `\n++++ Updating Tansaction Date:\n\tOld Date: ${dbXaction.date}\n\tNew Date: ${date}`;
              }
              dbXaction.date = date;
              dbXactionUpdated = true;
            }
          }
          // depending on the current perspective set the sign of the amount
          if (amount) {
            if ((perspective == "Infow" && amount < 0) || (perspective == "Outflow" && amount > 0)) amount *= -1;
            if (amount != previousAmount) {
              if (process.env.YET_DEBUG) {
                transactionLog += `\n++++ Updating Tansaction Amount:\n\tOld Amount: ${dbXaction.amount}\n\tNew Amount: ${amount}`;
              }
              dbXaction.amount = amount;
              dbXactionUpdated = true;
              amountUpdated = true;
            }
          }

          // check if Category and/or SubCategory should be changed. If subCategoryUUID
          // was passed and it is NOT the same as the one on the original transaction, then update the two fields
          if (subCategoryUUID && subCategoryUUID != previousSubCategoryUUID) {
            if (process.env.YET_DEBUG) {
              /* ********************** DEBUG **************************** */
              transactionLog += "\n++++ Updating Category/SubCategory:";
              transactionLog += `\n\tOld Category UUID:    ${dbXaction.categoryRef}`;
              transactionLog += `\n\tNew Category UUID:    ${categoryUUID}`;
              transactionLog += `\n\tOld SubCategory UUID: ${dbXaction.subCategoryRef}`;
              transactionLog += `\n\tNew SubCategory UUID: ${subCategoryRef}`;
              /* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
            }
            dbXaction.categoryRef = categoryUUID;
            dbXaction.subCategoryRef = subCategoryUUID;
            dbXactionUpdated = true;
          }
          // check if memo is to be updated
          if (memo) {
            dbXaction.memo = memo;
            dbXactionUpdated = true;
          }
          if (dbXactionUpdated == true) {
            // ******* SAVE/UPDATE Transaction ***************
            dbXaction = await dbXaction.save();
            response.transaction = TransactionController.getJSON(dbXaction);
            response.message += "Updated Transaction Record. ";
            if (process.env.YET_DEBUG) {
              /* ********************** DEBUG **************************** */
              transactionLog += "\n\n**** Saved Transaction ****\n" + TransactionController.getJSON(dbXaction);
              /* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
            }
            // if there is a change in the amount, update the Account balance
            if (amountUpdated) {
              // manual Adjustment = amount (current) - previousAmount
              manualAdjustment = amount - previousAmount;
              if (manualAdjustment != 0) {
                // get account and update it
                if (accountUUID && (dbAccount = await db.BudgetAccount.findById(accountUUID))) {
                  if (process.env.YET_DEBUG) {
                    /* ********************** DEBUG **************************** */
                    transactionLog += `\n\nUpdating BudgetAccount (manualAdjustment = ${manualAdjustment})\n`;
                    transactionLog += "************** OLD BUDGET ACCOUNT ***************\n";
                    transactionLog += AccountController.getJSON(dbAccount);
                    /* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
                  }
                  let balance = dbAccount.balance + manualAdjustment;
                  dbAccount.balance = balance;
                  dbAccount = await dbAccount.save();
                  response.account = AccountController.getJSON(dbAccount);
                  response.message += "Updated BudgetAccount Record. ";
                  if (process.env.YET_DEBUG) {
                    /* ********************** DEBUG **************************** */
                    transactionLog += "************** UPDATED BUDGET ACCOUNT ***************\n";
                    transactionLog += AccountController.getJSON(dbAccount);
                    /* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
                  }
                }
                if (manualAdjustment < 0) perspective = "Outflow";
                else perspective = "Inflow";
                manualAdjustmentCategoryName = perspective + " Adjustment";
                // find the category for the adjustment
                query = { categoryName: manualAdjustmentCategoryName, ownerRef: ownerRef };
                dbResults = await db.UserCategoryGroup.find(query);
                if (dbResults && dbResults.length != 0) {
                  dbManualAdjustmentCategory = dbResults[0];
                  dbManualAdjustmentCategoryUUID = dbManualAdjustmentCategory._id;
                  dbManualAdjustmentSubCategoryUUID = dbManualAdjustmentCategory.category[0]._id;

                  xactionModel = {
                    payee: "Manual Adjustment",
                    ownerRef: ownerRef,
                    accountRef: dbAccount._id,
                    categoryRef: dbManualAdjustmentCategoryUUID,
                    subCategoryRef: dbManualAdjustmentSubCategoryUUID,
                    perspective: perspective,
                    amount: manualAdjustment,
                  };
                  dbXaction = await db.Transaction.create(xactionModel);
                  response.manualAdjustment = TransactionController.getJSON(dbXaction);
                  response.message += "Created Transaction for Account Manual Adjustment";
                  transactionLog += "\n**** Saved Transaction ****\n" + TransactionController.getJSON(dbXaction);
                }
              }
            }
          }
        }
      }
    }
    if (transactionLog) {
      transactionLog += "\n^^^^^^^^^^^^^^^ TRANSACTION LOGGER END ^^^^^^^^^^^^^^^^^^^^^\n\n";
      console.log("\n\n", transactionLog);
    }
    console.log("Modify Transaction API Response:\n", response);
    res.json(response);
  })();
});

module.exports = router;
