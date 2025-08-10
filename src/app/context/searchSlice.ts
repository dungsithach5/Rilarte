import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  keyword: string;
  color: string | null;
}

const initialState: SearchState = {
  keyword: "",
  color: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setKeyword(state, action: PayloadAction<string>) {
      state.keyword = action.payload;
      state.color = null;
    },
    setColor(state, action: PayloadAction<string>) {
      state.color = action.payload;
      state.keyword = "";
    },
    clearSearch(state) {
      state.keyword = "";
      state.color = null;
    },
  },
});

export const { setKeyword, setColor, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;