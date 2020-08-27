import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { Balance } from "../../components/Balance";
import TransactionList from "../../components/TList";

function Expense() {
  return (
    <Container className="themed-container" fluid={true}>
      <Container>
        <Row>
          <Col sm="4">
            <Balance />
          </Col>
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
