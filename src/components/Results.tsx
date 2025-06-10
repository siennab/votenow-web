import React from "react";
import { useDispatch, useSelector } from "../store";
import { reOpenVote } from "../votingSlice";

const Results: React.FC = () => {
  const dispatch = useDispatch();
  const winner = useSelector((state) => state.voting.winner);

  return (
    <div>
      <div className="accent-box">
        <div className="message">The winner is...</div>
        <div>{winner ? winner.option : "No winner yet"}</div>
      </div>
      <button onClick={() => void dispatch(reOpenVote())}>Reopen Vote</button>
    </div>
  );
};

export default Results;
