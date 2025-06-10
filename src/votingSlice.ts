import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { VotingService } from './js/services/voting';

const votingService = new VotingService();

export const createGroup = createAsyncThunk('voting/createGroup', async () => {
  return votingService.createGroup();
});

export const addOption = createAsyncThunk('voting/addOption', async (option: string) => {
  return votingService.addOption(option);
});

export const closeVote = createAsyncThunk('voting/closeVote', async () => {
  return votingService.closeVote();
});

export const reOpenVote = createAsyncThunk('voting/reOpenVote', async () => {
  return votingService.reOpenVote();
});

interface Option {
  id: string;
  option: string;
  votes: number;
}

interface VotingState {
  groupId: string | null;
  options: Option[];
  status: string;
  winner: Option | null;
  totalIn: number;
  step: number;
}

const initialState: VotingState = {
  groupId: null,
  options: [],
  status: 'idle',
  winner: null,
  totalIn: 0,
  step: 1,
};

const votingSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    setStep(state, action) {
      state.step = action.payload;
    },
    setWinner(state, action) {
      state.winner = action.payload;
    },
    setTotalIn(state, action) {
      state.totalIn = action.payload;
    },
    setOptions(state, action) {
      state.options = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groupId = action.payload;
        state.step = 2;
      })
      .addCase(addOption.fulfilled, (state, action) => {
        state.options.push(action.payload);
      })
      .addCase(closeVote.fulfilled, (state) => {
        state.status = 'closed';
        state.step = 3;
      })
      .addCase(reOpenVote.fulfilled, (state) => {
        state.status = 'active';
        state.step = 2;
      });
  },
});

export const { setStep, setWinner, setTotalIn, setOptions } = votingSlice.actions;
export default votingSlice.reducer;
