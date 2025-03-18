// components/popUp/Questionnaire.jsx
import React, { useState } from "react";
import styled from "styled-components";

const QuestionnaireContainer = styled.div`
    text-align: center;
    margin-top: 20px;
`;

const Question = styled.p`
    font-size: 20px;
    color: #333;
    margin-bottom: 15px;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 20px;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 14px;
  color: black;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
  transition: background-color 0.3s ease;
  text-align: left;

    &:hover {
        background-color: #ddd;
    }
`;

const Checkbox = styled.input`
    margin-right: 10px;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const QuestionnaireYes = ({ onSubmit }) => {
    const [selectedReasons, setSelectedReasons] = useState([]);

    const handleReasonSelect = (reason) => {
        if (selectedReasons.includes(reason)) {
            // If the reason is already selected, remove it
            setSelectedReasons(selectedReasons.filter((r) => r !== reason));
        } else {
            // Otherwise, add it to the selected reasons
            setSelectedReasons([...selectedReasons, reason]);
        }
    };

    const handleSubmit = () => {
        onSubmit(selectedReasons);
    };

    return (
        <QuestionnaireContainer>
            <Question>Reason?</Question>
            <OptionLabel>
                <Checkbox
                    type="checkbox"
                    checked={selectedReasons.includes("Inconsistency")}
                    onChange={() => handleReasonSelect("Inconsistency")}
                />
                Inconsistency
            </OptionLabel>
            <OptionLabel>
                <Checkbox
                    type="checkbox"
                    checked={selectedReasons.includes("Unnatural posting patterns")}
                    onChange={() => handleReasonSelect("Unnatural posting patterns")}
                />
                Unnatural posting patterns
            </OptionLabel>
            <OptionLabel>
                <Checkbox
                    type="checkbox"
                    checked={selectedReasons.includes("Lacking quality and uniqueness")}
                    onChange={() => handleReasonSelect("Lacking quality and uniqueness")}
                />
                Lacking quality and uniqueness
            </OptionLabel>
            <OptionLabel>
                <Checkbox
                    type="checkbox"
                    checked={selectedReasons.includes("Lack of engagement")}
                    onChange={() => handleReasonSelect("Lack of engagement")}
                />
                Lack of engagement
            </OptionLabel>
            <OptionLabel>
                <Checkbox
                    type="checkbox"
                    checked={selectedReasons.includes("Other")}
                    onChange={() => handleReasonSelect("Other")}
                />
                Other
            </OptionLabel>
            <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
        </QuestionnaireContainer>
    );
};

export default QuestionnaireYes;