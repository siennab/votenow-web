import React, { useState } from "react";
import { useDispatch, useSelector } from "../store";
import { addOption, closeVote } from "../votingSlice";

interface Option {
  id: string;
  option: string;
  votes: number;
}

const Voting: React.FC = () => {
  const dispatch = useDispatch();
  const options = useSelector((state) => state.voting.options) as Option[];
  const [optionInput, setOptionInput] = useState<string>("");

  const handleAddOption = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (optionInput.trim()) {
      void dispatch(addOption(optionInput));
      setOptionInput("");
    }
  };

  return (
    <div>
      <form onSubmit={handleAddOption} id="add-option">
        <input
          type="text"
          value={optionInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setOptionInput(e.target.value)
          }
          required
          placeholder="Add what you're open to..."
        />
        <button type="submit">+</button>
      </form>
      <div>
        {options.map((opt) => (
          <div key={opt.id}>{opt.option}</div>
        ))}
      </div>
      <button onClick={() => void dispatch(closeVote())}>Close Vote</button>
    </div>
  );
};

export default Voting;
