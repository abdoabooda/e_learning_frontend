import { authActions } from "../slices/authSlice";
import request from "../../utils/request";
import {toast} from "react-toastify"

export function loginUser(user){

    return async (dispatch)=>{
        try {
            const {data} = await request.post("/api/auth/login",user)
            dispatch(authActions.login(data));
            localStorage.setItem("userInfo",JSON.stringify(data))
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }
}



export function logoutUser(){

    return (dispatch)=>{
        dispatch(authActions.logout())
        localStorage.removeItem("userInfo")
    }
}



export function registerUser(user) {
  return async (dispatch) => {
    try {
      const { data } = await request.post("/api/auth/register", user);
            
      // Set the success message
      toast.success(data.message);

      // Store user data in localStorage (but not the message)
      const userDataForStorage = data;
      delete userDataForStorage.message; // Remove message from localStorage data
            
      // Set user data in Redux state (without the message)
      dispatch(authActions.login(userDataForStorage));

      localStorage.setItem("userInfo", JSON.stringify(userDataForStorage));
      
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
}