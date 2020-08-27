import React, { useState, useEffect } from "react";
import TempAdd from "../TempAdd/";
import { Table, Card, Button } from "reactstrap";
import { getTransAPI } from "../../utils/TransactionAPI";
import { useAppContext } from "../../utils/globalStates/stateProvider";
import { ADD_TRANSACTION } from "../../utils/globalStates/actions";
import { parseDate } from "../../utils/dateformat";

import "./index.css";
export default function TransactionList(props) {
  const [transactions, setTransactions] = useState([]);
  const accountUUID = "63a9b997-d793-429e-bb93-eb57ae5ade9c";
  const [{ user }, dispatch] = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [newList, setNewList] = useState(false);

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
  }, [dispatch, newList, user.sessionUUID]);

  const renderBody = () => {
    return transactions?.map(
      ({ date, payee, categoryName, subCategoryName, amount }) => {
        return (
          <div className="transaction-item transaction-grid shadow">
            <div>{parseDate(`${date}`)}</div>
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
      <div className="add-btn-div">
        <Button className="add-btn width" onClick={() => setShowAdd(!showAdd)}>
          Add
        </Button>
      </div>
      <div className=" border shadow">
        <div className="transaction-container transaction-grid">
          <div className="column-name "> Date </div>
          <div className="column-name"> Payee</div>
          <div className="column-name"> Category </div>
          <div className="column-name"> Amount </div>
        </div>
      </div>
      {showAdd ? (
        <TempAdd
          setShowAdd={() => setShowAdd(!showAdd)}
          setNewList={() => setNewList(!newList)}
        />
      ) : null}
      {renderBody()}
    </div>
  );
}
