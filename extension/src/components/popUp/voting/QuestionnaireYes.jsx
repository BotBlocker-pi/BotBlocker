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

const OtherInput = styled.input`
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 10px;
    width: 80%;
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
    const [otherReason, setOtherReason] = useState("");

    const handleReasonSelect = (reason) => {
        if (selectedReasons.includes(reason)) {
            setSelectedReasons(selectedReasons.filter((r) => r !== reason));
        } else {
            setSelectedReasons([...selectedReasons, reason]);
        }
    };

    const handleOtherReasonChange = (e) => {
        setOtherReason(e.target.value);
    };

    const handleSubmit = () => {
        if (selectedReasons.includes("Other") && otherReason.trim() === "") {
            alert("Please specify the reason for selecting 'Other'.");
            return;
        }

        const reasonsToSubmit = selectedReasons.includes("Other")
            ? [...selectedReasons.filter((r) => r !== "Other"), `Other: ${otherReason}`]
            : selectedReasons;

        onSubmit(reasonsToSubmit); // Pass the reasons back to the parent component
    };

    return (
        <QuestionnaireContainer>
            <Question>Why do you think this profile is AI?</Question>
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
            {selectedReasons.includes("Other") && (
                <OtherInput
                    type="text"
                    placeholder="Please specify the reason..."
                    value={otherReason}
                    onChange={handleOtherReasonChange}
                />
            )}
            <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
        </QuestionnaireContainer>
    );
};

export default QuestionnaireYes;