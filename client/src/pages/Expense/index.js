import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Balance } from "../../components/Balance";
import TransactionList from "../../components/TransactionList/";

function Expense() {
  return (
    <Container className="themed-container" fluid={true}>
      <Container>
        <Row>
          <Balance />
        </Row>
        <Row>
          <Col>
            <TransactionList />
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Expense;
