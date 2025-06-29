import {  createSlice  }  from "@reduxjs/toolkit" ;


const lessonSlice = createSlice({

    name : "lesson",
    initialState: {
        lesson:null,
        quiz:null,
        question:null,
        lessons:[],
        quizzes:[],
        questions:[],
        isLessonCreated : false,
        isQuizCreated : false,
        isQuestionCreated : false,
        loading : false,
        
    },

    reducers :{
        setLessons(state,action){
            state.lessons =action.payload
        },
        setQuizzes(state,action){
            state.quizzes =action.payload
        },
        setQuestions(state,action){
            state.questions =action.payload
        },
        setQuiz(state,action){
            state.quiz = action.payload;
        },
        setLesson(state,action){
            state.lesson = action.payload;
        },
        setQuestion(state,action){
            state.question = action.payload;
        },
        setLoading(state){
            state.loading = true
        },
        clearLoading(state){
            state.loading = false
        },
        setIsLessonCreated(state){
            state.isLessonCreated = true
            state.loading = false
        },
        clearIsLessonCreated(state){
            state.isLessonCreated = false
        },
        setIsQuizCreated(state){
            state.isQuizCreated = true
            state.loading = false
        },
        clearIsQuizCreated(state){
            state.isQuizCreated = false
        },
        setIsQuestionCreated(state){
            state.isQuestionCreated = true
            state.loading = false
        },
        clearIsQuestionCreated(state){
            state.isQuestionCreated = false
        },

    }
}
)


const lessonReducer = lessonSlice.reducer
const lessonActions = lessonSlice.actions

export {lessonReducer,lessonActions}