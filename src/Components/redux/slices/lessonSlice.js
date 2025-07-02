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
        setQuizzes(state, action) {
            const newQuizzes = action.payload;

            const existingIds = new Set(state.quizzes.map(q => q._id));
            const merged = [...state.quizzes];

            newQuizzes.forEach(q => {
            if (!existingIds.has(q._id)) {
            merged.push(q);
             }
        });

        state.quizzes = merged;
        },
        setQuestions(state, action) {
        // If it's the first quiz or we want to replace all
          if (!state.questions) {
             state.questions = action.payload;
          } else {
         // Append new questions, avoiding duplicates
            const existingIds = new Set(state.questions.map(q => q._id));
            const newQuestions = action.payload.filter(q => !existingIds.has(q._id));
            state.questions = [...state.questions, ...newQuestions];
         }
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