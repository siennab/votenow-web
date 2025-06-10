import React from "react";
import { useDispatch } from "../store";
import { createGroup } from "../votingSlice";

const StartVote: React.FC = () => {
  const dispatch = useDispatch();
  return (
    <div>
      <button
        className="accent-box accent-box--block"
        onClick={() => void dispatch(createGroup())}
      >
        Start Vote
      </button>
    </div>
  );
};

export default StartVote;
