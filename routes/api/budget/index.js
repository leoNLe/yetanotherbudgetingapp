
/****************************************************************************************
 *                                    HISTORY                                           *
 ****************************************************************************************
 *                                                                                      *
 * == chikeobi-03 ==                                                                    *
 *   +    Created                                                                       *
 *   +                                                                                  *
 * == chikeobi-03 ==                                                                    *
 *   +  Changed route paths to match new names. Added "listBudget" and                  *
 *        "modifyBudgetItem" routes                                                     *
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
const router = require("express").Router();

const getBudgetItemRoute = require("./getBudgetItem");
const listBudgetRoute = require("./listBudget");
const modifyBudgetItemRoute = require("./modifyBudgetItem");
const setBudgetItemRoute = require("./setBudgetItem");

router.use("/getBudgetItem", getBudgetItemRoute);
router.use("/listBudget", listBudgetRoute);
router.use("/modifyBudgetItem", modifyBudgetItemRoute);
router.use("/setBudgetItem", setBudgetItemRoute);

module.exports = router;