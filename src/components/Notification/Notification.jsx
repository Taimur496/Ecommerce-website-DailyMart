import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";

const Notification = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div>
      <Container className="TopSection">
        <Row>
          {[1, 2].map((item, index) => (
            <Col className="p-1" md={6} lg={6} sm={12} xs={12} key={index}>
              <Card
                onClick={handleShow}
                className="notification-card cursor-pointer"
              >
                <Card.Body>
                  <h6>Lorem Ipsum is simply dummy text of the printing</h6>
                  <p className="py-1 px-0 text-primary m-0">
                    <i className="fa fa-bell"></i> Date: 22/12/2010 | Status:
                    Unread
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}

          {[1, 2, 3, 4].map((item, index) => (
            <Col className="p-1" md={6} lg={6} sm={12} xs={12} key={index}>
              <Card className="notification-card">
                <Card.Body>
                  <h6>Lorem Ipsum is simply dummy text of the printing</h6>
                  <p className="py-1 px-0 text-success m-0">
                    <i className="fa fa-bell"></i> Date: 22/12/2010 | Status:
                    Read
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static" // Prevents clicking outside to close
        keyboard={true} // Still allows ESC to close
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <h6>
            <i className="fa fa-bell"></i> Date: 11/05/2021
          </h6>
        </Modal.Header>
        <Modal.Body>
          <h6>Woohoo, you're reading this text in a modal!</h6>
          <p>
            Each course has been hand-tailored to teach a specific skill.
            Whether you're learning from scratch or refreshing your memory,
            you're in the right place.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notification;
