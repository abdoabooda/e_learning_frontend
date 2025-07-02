import { lessonActions } from "../slices/lessonSlice";
import request from "../../utils/request";
import { toast } from "react-toastify"




// Create lesson
export function createLesson(newLesson,courseId) {
  return async (dispatch,getState) => {
    try {
    dispatch(lessonActions.setLoading())
       await request.post(`/api/lessons/courses/${courseId}/lessons`,newLesson,{
        headers :{
          Authorization : "Bearer " + getState().auth.user.token,
          "Content-Type" : "multipart/form-data"
        }
      });
      dispatch(lessonActions.setIsLessonCreated());
      setTimeout(()=>dispatch(lessonActions.clearIsLessonCreated()),2000)
    } catch (error) {
      toast.error(error.response.data.message);
      dispatch(lessonActions.clearLoading())
    }
  };
}

// Create quiz
export function createQuiz(newQuiz,courseId) {
  return async (dispatch,getState) => {
    try {
    dispatch(lessonActions.setLoading())
       await request.post(`/api/quizzes/courses/${courseId}/quiz`,newQuiz,{
        headers :{
          Authorization : "Bearer " + getState().auth.user.token,
          "Content-Type" : "application/json"
        }
      });
      dispatch(lessonActions.setIsQuizCreated());
      setTimeout(()=>dispatch(lessonActions.clearIsQuizCreated()),2000)
    } catch (error) {
      toast.error(error.response.data.message);
      dispatch(lessonActions.clearLoading())
    }
  };
}



// Create question
export function createQuestion(newQuestion) {
  return async (dispatch,getState) => {
    try {
    dispatch(lessonActions.setLoading())
       await request.post(`/api/questions`,newQuestion,{
        headers :{
          Authorization : "Bearer " + getState().auth.user.token,
          "Content-Type" : "application/json"
        }
      });
      dispatch(lessonActions.setIsQuestionCreated());
      setTimeout(()=>dispatch(lessonActions.clearIsQuestionCreated()),2000)
    } catch (error) {
      toast.error(error.response.data.message);
      dispatch(lessonActions.clearLoading())
    }
  };
}




// Fetch lessons 
export function fetchAllLessons() {
  return async (dispatch,getState) => {
    try {
      const { data } = await request.get(`/api/lessons/admin`,{
        headers :{
          Authorization : "Bearer " + getState().auth.user.token,
          "Content-Type" : "application/json"
        }})
      dispatch(lessonActions.setLessons(data.lessons))
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
}




// Fetch lessons 
export function fetchInstructorLessons() {
  return async (dispatch,getState) => {
    try {
      const { data } = await request.get(`/api/lessons/instructor`,{
        headers :{
          Authorization : "Bearer " + getState().auth.user.token,
          "Content-Type" : "application/json"
        }})
      dispatch(lessonActions.setLessons(data.lessons))
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
}



// Fetch quizzes 
export function fetchQuizzes(courseId) {
  return async (dispatch,getState) => {
    try {
      const { data } = await request.get(`/api/quizzes/courses/${courseId}/quizzes`,{
        headers :{
          Authorization : "Bearer " + getState().auth.user.token,
          "Content-Type" : "application/json"
        }})
      dispatch(lessonActions.setQuizzes(data.quizzes))
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
}


// Fetch questions 
export function fetchQuestions(quizId) {
  return async (dispatch,getState) => {
    try {
      const { data } = await request.get(`/api/questions/quizzes/${quizId}/questions`,{
        headers :{
          Authorization : "Bearer " + getState().auth.user.token,
          "Content-Type" : "application/json"
        }})
      dispatch(lessonActions.setQuestions(data.questions))
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
}



// Update lesson 
export function updateLesson(newLesson,lessonId) {
  return async (dispatch,getState) => {
    try {
      const {data} = await request.put(`/api/lessons/${lessonId}`,newLesson,{
      headers : {
        Authorization : "Bearer " + getState().auth.user.token,
      }
      });
      dispatch(lessonActions.setLesson(data.lesson))
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
}




// Update Lesson Image
export function updateLessonVideo(newVideo,lessonId) {
  return async (dispatch,getState) => {
    try {
       await request.put(`/api/lessons/update-image/${lessonId}`,newVideo,{
      headers : {
        Authorization : "Bearer " + getState().auth.user.token,
        "Content-Type":"multipart/form-data",
      }
      });
      toast.success("New lesson video uploaded sucessfully")
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
}




// Update quiz 
export function updateQuiz(newQuiz,quizId) {
  return async (dispatch,getState) => {
    try {
      const {data} = await request.put(`/api/quizzes/${quizId}`,newQuiz,{
      headers : {
        Authorization : "Bearer " + getState().auth.user.token,
      }
      });
      dispatch(lessonActions.setQuiz(data))
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
}




// Update question 
export function updateQuestion(newQuestion,questionId) {
  return async (dispatch,getState) => {
    try {
      const {data} = await request.put(`/api/questions/${questionId}`,newQuestion,{
      headers : {
        Authorization : "Bearer " + getState().auth.user.token,
      }
      });
      dispatch(lessonActions.setQuestion(data.question))
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
}