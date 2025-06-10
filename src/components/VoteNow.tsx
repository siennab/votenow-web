import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "../store";
import {
  createGroup,
  addOption,
  closeVote,
  reOpenVote,
  setStep,
  setOptions,
  setWinner,
  setTotalIn,
} from "../votingSlice";
import { VotingService } from "../js/services/voting";

const votingService = new VotingService();

const VoteNow: React.FC = () => {
  const dispatch = useDispatch();
  const { groupId, options, step, status, winner, totalIn } = useSelector(
    (state) => state.voting
  );
  const [optionInput, setOptionInput] = useState("");
  const [votes, setVotes] = useState<string[]>([]);
  const [overlayHidden, setOverlayHidden] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let groupIdParam = urlParams.get("groupId");
    if (groupIdParam) {
      groupIdParam = groupIdParam.replace(/[^\w]/g, "");
      votingService.getGroup(groupIdParam, (snapshot: any) => {
        const option = snapshot.val();
        dispatch(setOptions([option]));
      });
      votingService.subscribeToStatusChanges((group: any) => {
        dispatch(setTotalIn(group?.totalIn || 0));
        if (group?.status === "closed") {
          dispatch(setWinner(group.winner));
          dispatch(setStep(3));
        } else {
          dispatch(setStep(2));
        }
      });
    }
    setTimeout(() => setOverlayHidden(true), 1000);
  }, [dispatch]);

  const handleVote = (optionId: string, checked: boolean) => {
    if (checked) {
      votingService.checkOption(optionId);
    } else {
      votingService.uncheckOption(optionId);
    }
    setVotes(votingService.getVotes());
  };

  const handleAddOption = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (optionInput.trim()) {
      void dispatch(addOption(optionInput));
      setOptionInput("");
    }
  };

  const share = (message = "Give your input!") => {
    if (navigator.share) {
      navigator.share({
        title: "Voty",
        text: message,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert(
          "The link to this Voty has been copied to your clipboard. To share what you're seeing, simply paste it to your group."
        );
      });
    }
  };

  return (
    <div>
      <div className={`overlay${overlayHidden ? " hide" : ""}`} id="overlay">
        <h1>Voty</h1>
      </div>
      <header>
        <a href="/">
          <h1>Voty</h1>
        </a>
      </header>
      <div className="vote" id="vote">
        {step === 1 && (
          <div data-step-1>
            <button
              className="accent-box accent-box--block"
              onClick={() => {
                void dispatch(createGroup()).then((action: any) => {
                  window.location.href = `${window.location}?groupId=${action.payload}`;
                });
              }}
            >
              Start Vote
            </button>
          </div>
        )}
        {step === 2 && (
          <div data-step-2>
            <div data-step-2-message className="message">
              <span>Select</span> what you're open to. Tip: The more you select,
              the better the outcome for the group. Keep an open mind{" "}
              <img src="img/icons/peace-hand.svg" width="20" alt="peace" />
            </div>
            <div className="options-container">
              <div id="options">
                {options.map((opt: any) => (
                  <div key={opt.id}>
                    <input
                      type="checkbox"
                      id={opt.id}
                      name="voting-option"
                      checked={votes.includes(opt.id.toString())}
                      onChange={(e) => handleVote(opt.id, e.target.checked)}
                    />
                    <label htmlFor={opt.id}>{opt.option}</label>
                  </div>
                ))}
              </div>
              <form id="add-option" onSubmit={handleAddOption}>
                <input
                  type="text"
                  id="option"
                  required
                  placeholder="Add what you're open to..."
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                />
                <button id="message-btn" type="submit">
                  &plus;
                </button>
              </form>
              <div id="done-message" className="message right spacer">
                Total voters so far: <span id="total-in">{totalIn}</span>
              </div>
            </div>
            <div className="bottom-bar">
              <button id="share-button" onClick={() => share()}>
                {" "}
                <img
                  width="18"
                  alt="share"
                  src="img/icons/arrow-up-from-bracket-solid.svg"
                />
              </button>
              <button
                className="inline"
                disabled={totalIn < 1}
                id="close-group-button"
                onClick={() => void dispatch(closeVote())}
              >
                Close Vote
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <section data-step-3 id="result">
            <div className="accent-box" id="result-accent">
              <div className="message">The winner is...</div>
              <div id="result-accent-result">{winner ? winner.option : ""}</div>
            </div>
            <div className="bottom-bar">
              <button
                className="inline transparent"
                id="vote-again-button"
                onClick={() => void dispatch(reOpenVote())}
              >
                Reopen Vote
              </button>
              <button
                id="share-button-results"
                onClick={() => share("The winner is...")}
              >
                {" "}
                <img
                  width="18"
                  alt="share"
                  src="img/icons/arrow-up-from-bracket-solid.svg"
                />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default VoteNow;
