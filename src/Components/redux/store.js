import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/authSlice";
import {chatReducer} from './slices/chatSlice';
import { profileReducer } from "./slices/profileSlice";
import { courseReducer } from "./slices/courseSlice";
import { passwordReducer } from "./slices/passwordSlice";
import { lessonReducer } from "./slices/lessonSlice";

const store = configureStore({
    reducer: {
        auth : authReducer,
        chat : chatReducer,
        profile:profileReducer,
        course:courseReducer,
        password: passwordReducer,
        lesson:lessonReducer,
    }
});

export default store;