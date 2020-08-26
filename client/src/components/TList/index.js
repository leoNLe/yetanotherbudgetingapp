import React, { useState, useEffect } from "react";
import { Table, Card } from "reactstrap";
import { getTransAPI } from "../../utils/TransactionAPI";
import { useAppContext } from "../../utils/globalStates/stateProvider";
import { ADD_TRANSACTION } from "../../utils/globalStates/actions";
import "./index.css";
export default function TransactionList(props) {
  const [transactions, setTransactions] = useState([]);
  const accountUUID = "63a9b997-d793-429e-bb93-eb57ae5ade9c";
  const [{ user }, dispatch] = useAppContext();

  useEffect(() => {
    getTransAPI(user.sessionUUID, accountUUID)
      .then((response) => {
        console.log(response);
        setTransactions(response.data.transaction);
        dispatch({ type: ADD_TRANSACTION, payload: response.data.transaction });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [dispatch, props.change, user.sessionUUID]);
  const renderHeader = () => {
    let headerElement = ["date", "payee", "category", "subcategory", "amount"];

    return headerElement.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  const renderBody = () => {
    return transactions?.map(
      ({ payee, categoryName, subCategoryName, amount }) => {
        return (
          <div className="transaction-item shadow">
            <div>{Intl.DateTimeFormat("en-US").format(props.date)}</div>
            <div>{payee}</div>
            <div>{`${categoryName}: ${subCategoryName}`}</div>
            <div> ${amount}</div>
          </div>
        );
      }
    );
  };
  return (
    <div style={{ marginTop: "1rem" }}>
      <div className="border shadow">
        <div className="transaction-container">
          <div className="column-name "> Date </div>
          <div className="column-name"> Payee</div>
          <div className="column-name"> Category </div>
          <div className="column-name"> Amount </div>
        </div>
      </div>
      {renderBody()}
    </div>
  );
}
