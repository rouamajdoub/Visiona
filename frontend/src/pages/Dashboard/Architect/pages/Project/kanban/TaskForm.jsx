import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTask } from "../../../../../../redux/slices/TaskSlice"; // Adjust path as needed
import styled from "styled-components";

// Styled components
// Styled components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const FormContainer = styled.div`
  background: #eaeefe;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--pink, #ff919d);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #ff919d;
  }
`;

const FormTitle = styled.h2`
  color: var(--pink, #ff919d);
  margin-bottom: 20px;
  text-align: center;
  position: sticky;
  background: #eaeefe;
  padding: 5px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  color: var(--pink, #242d49);
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #242d49;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  background-color: #eaeefe;
  color: #242d49;

  &:focus {
    outline: none;
    border-color: var(--pink, #ff919d);
    box-shadow: 0 0 0 2px rgba(255, 0, 149, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  box-sizing: border-box;
  resize: vertical;
  background-color: #eaeefe;
  color: #242d49;

  &:focus {
    outline: none;
    border-color: var(--pink, #ff919d);
    box-shadow: 0 0 0 2px rgba(255, 0, 149, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  background-color: #eaeefe;

  &:focus {
    outline: none;
    border-color: var(--pink, #ff919d);
    box-shadow: 0 0 0 2px rgba(255, 0, 149, 0.2);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  position: sticky;
  bottom: 0;
  background: #eaeefe;
  padding: 10px 0 0;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
  background-color: #e0e0e0;
  color: #333;

  &:hover {
    background-color: #eaeefe;
  }
`;

const SubmitButton = styled(Button)`
  background-color: var(--pink, #ff0095);
  color: white;

  &:hover {
    background-color: #d6008f;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const TaskForm = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.tasks.loading);

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: "todo",
    dueDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createTask(taskData))
      .unwrap()
      .then(() => {
        handleClose();
        setTaskData({
          title: "",
          description: "",
          status: "todo",
          dueDate: "",
        });
      })
      .catch((error) => {
        console.error("Failed to create task:", error);
      });
  };

  if (!open) return null;

  return (
    <Modal onClick={handleClose}>
      <FormContainer onClick={(e) => e.stopPropagation()}>
        <FormTitle>Add New Task</FormTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={taskData.description}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              value={taskData.status}
              onChange={handleChange}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              type="date"
              id="dueDate"
              name="dueDate"
              value={taskData.dueDate}
              onChange={handleChange}
            />
          </FormGroup>

          <ButtonContainer>
            <CancelButton
              type="button"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Task"}
            </SubmitButton>
          </ButtonContainer>
        </Form>
      </FormContainer>
    </Modal>
  );
};

export default TaskForm;
