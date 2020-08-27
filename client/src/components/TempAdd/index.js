import React, { useState, useEffect } from "react";
import { Input, Form, Button } from "reactstrap";
import CurrencyInput from "../CurrentcyInput/";
import { useAppContext } from "../../utils/globalStates/stateProvider";
import { getBudgetListAPI } from "../../utils/CategoryAPI";
import { createTransAPI } from "../../utils/TransactionAPI";
import { yearMonthToString } from "../../utils/dateformat";
import "./index.css";
function TempAdd(props) {
  const [{ user }] = useAppContext();
  const [date, setDate] = useState(new Date());
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subCatID, setSubCatID] = useState("");
  const [mainCatID, setMainCatID] = useState("");
  const dateObj = new Date();
  const [yearMonth] = useState(
    yearMonthToString(dateObj.getFullYear(), dateObj.getMonth())
  );
  const accountUUID = "63a9b997-d793-429e-bb93-eb57ae5ade9c";

  useEffect(() => {
    getBudgetListAPI(user.sessionUUID, yearMonth).then((response) => {
      console.log(response.data);
      const tempCat = response.data.budget.map((category) => {
        const tempSubCat = category.subCategory.map((subCategory) => {
          return {
            subCategoryName: subCategory.subCategoryName,
            subCategoryUUID: subCategory.subCategoryUUID,
          };
        });
        return {
          categoryName: category.categoryName,
          categoryUUID: category.categoryUUID,
          subCategory: tempSubCat,
        };
      });
      setCategories(tempCat);
    });
  }, [user.sessionUUID, yearMonth]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (payee === "" || mainCatID === "" || subCatID === "" || amount === 0) {
      return;
    }
    createTransAPI(
      user.sessionUUID,
      accountUUID,
      payee,
      mainCatID,
      subCatID,
      amount,
      date.replaceAll("-", ""),
      []
    ).then((response) => {
      props.setNewList();
      props.setShowAdd();
    });
  };
  const handleCategorySelect = (e) => {
    const value = JSON.parse(e.target.value);
    setSubCatID(value.subCategoryUUID);
    setMainCatID(value.categoryUUID);
  };
  return (
    <Form className="shadow form-div " onSubmit={handleSubmit}>
      <div className="add-transaction-grid ">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          placeholder="Payee Name"
          value={payee}
          onChange={(e) => setPayee(e.target.value)}
        />
        <Input type="select" onChange={handleCategorySelect}>
          <option value="" disabled selected hidden>
            Select a Category
          </option>

          {categories.map((category) => {
            return category.subCategory.map((subCategory) => {
              return (
                <option
                  value={JSON.stringify({
                    subCategoryUUID: subCategory.subCategoryUUID,
                    categoryUUID: category.categoryUUID,
                  })}
                >
                  {subCategory.subCategoryName}
                </option>
              );
            });
          })}
        </Input>
        <CurrencyInput
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="add-transaction-div ">
        <Button
          className="bg-danger cancel-btn"
          onClick={() => props.setShowAdd()}
        >
          Cancel
        </Button>
        <Button type="submit" className="add-btn">
          Add Transaction
        </Button>
      </div>
    </Form>
  );
}

export default TempAdd;
