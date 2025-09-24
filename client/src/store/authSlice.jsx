// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: null,
    user: null, // có thể lưu name, email, role từ BE trả về khi login
  },
  reducers: {
    setToken: (state, action) => {
      const { accessToken } = action.payload;
      state.accessToken = accessToken;
    },
    setCredentials: (state, action) => {
      const  user = action.payload;
      
      state.user = user;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { setToken, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
