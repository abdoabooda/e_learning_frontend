import { useEffect, useState, useRef, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import './main.css';

import {
  fetchCourses,
  fetchInstructorCourses,
} from '../../redux/apiCalls/courseApiCall';

import {
  fetchQuizzes,
  fetchQuestions,
  createQuestion,
  updateQuestion,
} from '../../redux/apiCalls/lessonApiCall';

export default function Questions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { courses, instructorCourses } = useSelector((state) => state.course);
  const { quizzes, questions } = useSelector((state) => state.lesson);

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterQuiz, setFilterQuiz] = useState('');
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);

  // Track which quizzes have had their questions fetched
  const fetchedQuizIds = useRef(new Set());
  const isInitialLoad = useRef(true);
  const fetchTimeout = useRef(null);

  const [formData, setFormData] = useState({
    quizId: '',
    name: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  // Debug logs to check data
  console.log('Current state:', { 
    courses: courses?.length || 0, 
    instructorCourses: instructorCourses?.length || 0,
    quizzes: quizzes?.length || 0, 
    questions: questions?.length || 0,
    filterCourse,
    filterQuiz,
    fetchedQuizIds: fetchedQuizIds.current.size
  });

  // Redirect unauthorized users
  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role === 'student') return navigate('/unauthorized');
  }, [user, navigate]);

  // Get current courses based on user role
  const getCurrentCourses = useCallback(() => {
    const courseList = user?.role === 'admin' ? courses : instructorCourses;
    return Array.isArray(courseList) ? courseList : [];
  }, [user?.role, courses, instructorCourses]);

  // Fetch courses on mount
  useEffect(() => {
    if (!user || !isInitialLoad.current) return;
    
    setLoading(true);
    if (user.role === 'admin') {
      dispatch(fetchCourses()).finally(() => setLoading(false));
    } else if (user.role === 'instructor') {
      dispatch(fetchInstructorCourses()).finally(() => setLoading(false));
    }
  }, [dispatch, user]);

  // Fetch all quizzes when courses are loaded (only once)
  useEffect(() => {
    const courseList = getCurrentCourses();
    
    if (courseList.length > 0 && isInitialLoad.current) {
      setQuizLoading(true);
      const fetchPromises = courseList.map(course => 
        dispatch(fetchQuizzes(course._id))
      );
      
      Promise.all(fetchPromises)
        .then(() => {
          console.log('All quizzes fetched');
        })
        .catch(error => {
          console.error('Error fetching quizzes:', error);
        })
        .finally(() => {
          setQuizLoading(false);
        });
    }
  }, [dispatch, getCurrentCourses]);

  // Debounced function to fetch questions
  const debouncedFetchQuestions = useCallback(() => {
    if (fetchTimeout.current) {
      clearTimeout(fetchTimeout.current);
    }

    fetchTimeout.current = setTimeout(() => {
      if (quizzes && quizzes.length > 0 && isInitialLoad.current) {
        setQuestionLoading(true);
        
        // Only fetch questions for quizzes we haven't fetched yet
        const quizzesToFetch = quizzes.filter(quiz => 
          !fetchedQuizIds.current.has(quiz._id)
        );

        if (quizzesToFetch.length === 0) {
          setQuestionLoading(false);
          isInitialLoad.current = false;
          return;
        }

        console.log(`Fetching questions for ${quizzesToFetch.length} new quizzes`);
        
        // Fetch questions with proper rate limiting
        const fetchQuestionsWithDelay = async () => {
          for (const quiz of quizzesToFetch) {
            try {
              // Mark as being fetched immediately to prevent duplicates
              fetchedQuizIds.current.add(quiz._id);
              
              await dispatch(fetchQuestions(quiz._id));
              
              // Add delay between requests to avoid rate limiting
              if (quizzesToFetch.indexOf(quiz) < quizzesToFetch.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
              }
            } catch (error) {
              console.error(`Error fetching questions for quiz ${quiz._id}:`, error);
              // Remove from fetched set if failed, so we can retry later
              fetchedQuizIds.current.delete(quiz._id);
            }
          }
          setQuestionLoading(false);
          isInitialLoad.current = false;
        };
        
        fetchQuestionsWithDelay();
      }
    }, 1000); // 1 second debounce
  }, [dispatch, quizzes]);

  // Fetch questions with debouncing
  useEffect(() => {
    debouncedFetchQuestions();
    
    return () => {
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
    };
  }, [debouncedFetchQuestions]);

  // Reset filters when data changes
  useEffect(() => {
    if (filterCourse) {
      setFilterQuiz('');
    }
  }, [filterCourse]);

  // Helper function to check if questions exist for a quiz
  const hasQuestionsForQuiz = (quizId) => {
    return Array.isArray(questions) && questions.some(q => q.quiz === quizId);
  };

  const getQuizzesByCourse = (courseId) => {
    if (!Array.isArray(quizzes) || !courseId) return [];
    
    return quizzes.filter(quiz => {
      const quizCourseId = quiz.course?._id || quiz.course || quiz.courseId;
      return quizCourseId === courseId;
    });
  };

  const getQuizById = (quizId) => {
    if (!Array.isArray(quizzes)) return null;
    return quizzes.find(q => q._id === quizId);
  };

  const getAvailableQuizzes = () => {
    if (filterCourse) {
      return getQuizzesByCourse(filterCourse);
    }
    return Array.isArray(quizzes) ? quizzes : [];
  };

  const getQuestionsByCourse = (courseId) => {
    if (!Array.isArray(questions) || !courseId) return [];
    
    return questions.filter(question => {
      const quiz = getQuizById(question.quiz);
      if (!quiz) return false;
      
      const quizCourseId = quiz.course?._id || quiz.course || quiz.courseId;
      return quizCourseId === courseId;
    });
  };

  const getQuestionsByQuiz = (quizId) => {
    if (!Array.isArray(questions) || !quizId) return [];
    return questions.filter(q => q.quiz === quizId);
  };

  const getFilteredQuestions = () => {
    let filtered = Array.isArray(questions) ? [...questions] : [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.name && q.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (filterCourse) {
      filtered = filtered.filter(q => {
        const quiz = getQuizById(q.quiz);
        if (!quiz) return false;
        const quizCourseId = quiz.course?._id || quiz.course || quiz.courseId;
        return quizCourseId === filterCourse;
      });
    }

    // Filter by quiz
    if (filterQuiz) {
      filtered = filtered.filter(q => q.quiz === filterQuiz);
    }

    return filtered;
  };

  const filteredQuestions = getFilteredQuestions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingQuestion) {
        await dispatch(updateQuestion(formData, editingQuestion._id));
      } else {
        await dispatch(createQuestion(formData));
      }
      resetForm();
      
      // Only refresh questions for the affected quiz if it hasn't been fetched
      if (formData.quizId && !hasQuestionsForQuiz(formData.quizId)) {
        dispatch(fetchQuestions(formData.quizId));
        fetchedQuizIds.current.add(formData.quizId);
      }
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      quizId: '',
      name: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    });
    setEditingQuestion(null);
    setShowModal(false);
  };

  const handleEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      quizId: q.quiz,
      name: q.name,
      options: q.options || ['', '', '', ''],
      correctAnswer: q.correctAnswer || 0,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      // dispatch(deleteQuestion(id));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const currentCourses = getCurrentCourses();
  const availableQuizzes = getAvailableQuizzes();

  return (
    <Layout>
      <div className="courses-page">
        <div className="page-header">
          <h1 className="heading">Questions Management</h1>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus className="icon" /> Add Question
          </Button>
        </div>

        {/* Debug Info - Remove in production */}
        <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '20px', fontSize: '12px' }}>
          <strong>Debug Info:</strong> 
          Courses: {currentCourses.length} | 
          Quizzes: {quizzes?.length || 0} | 
          Questions: {questions?.length || 0} | 
          Filtered Questions: {filteredQuestions.length} |
          Available Quizzes for Course: {availableQuizzes.length} |
          Fetched Quiz IDs: {fetchedQuizIds.current.size}
        </div>

        {/* Loading States */}
        {(loading || quizLoading || questionLoading) && (
          <div className="text-center" style={{ padding: '20px' }}>
            <div>
              {loading && "Loading courses..."}
              {quizLoading && "Loading quizzes..."}
              {questionLoading && "Loading questions..."}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="course-actions">
          <div className="form-group">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input search-input"
              />
            </div>
          </div>
          <div className="form-group">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="form-input"
            >
              <option value="">All Courses ({currentCourses.length})</option>
              {currentCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} ({getQuizzesByCourse(course._id).length} quizzes)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              value={filterQuiz}
              onChange={(e) => setFilterQuiz(e.target.value)}
              className="form-input"
              disabled={!availableQuizzes.length}
            >
              <option value="">All Quizzes ({availableQuizzes.length})</option>
              {availableQuizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title} ({getQuestionsByQuiz(quiz._id).length} questions)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="card">
          <div className="card-header">
            <h3 className="heading">
              Questions ({filteredQuestions.length})
            </h3>
          </div>
          <div className="lesson-list">
            {filteredQuestions.length === 0 ? (
              <div className="text-center text-secondary" style={{ padding: '40px' }}>
                {questionLoading ? 'Loading questions...' : 
                 filterCourse || filterQuiz ? 'No questions found for the selected filters.' :
                 'No questions available. Create your first question!'}
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const quiz = getQuizById(q.quiz);
                const course = quiz ? currentCourses.find(c => {
                  const quizCourseId = quiz.course?._id || quiz.course || quiz.courseId;
                  return c._id === quizCourseId;
                }) : null;

                return (
                  <div key={q._id} className="lesson-item">
                    <div className="lesson-content">
                      <div className="lesson-title">
                        <HelpCircle className="icon text-blue" />
                        <h4 className="heading">{q.name}</h4>
                        <span className="badge badge-order">{q.points || 0} points</span>
                      </div>
                      <div className="quiz-meta">
                        <div className="meta-item">
                          Course: {course?.title || quiz?.course?.title || 'Unknown Course'}
                        </div>
                        <div className="meta-item">Quiz: {quiz?.title || 'Unknown Quiz'}</div>
                        <div className="meta-item">
                          Correct Answer: {q.options && q.options[q.correctAnswer] ? q.options[q.correctAnswer] : 'N/A'}
                        </div>
                      </div>
                      <div className="text-secondary text-sm">
                        Options: {q.options ? q.options.filter(Boolean).join(', ') : 'N/A'}
                      </div>
                    </div>
                    <div className="course-actions">
                      <Button variant="secondary" onClick={() => handleEdit(q)}>
                        <Edit2 className="icon" />
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(q._id)}>
                        <Trash2 className="icon" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="course-form-container modal-content">
              <h2 className="heading">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group">
                  <label>Quiz *</label>
                  <select
                    value={formData.quizId}
                    onChange={(e) => setFormData({ ...formData, quizId: e.target.value })}
                    required
                    className="form-input"
                  >
                    <option value="">Select a quiz</option>
                    {(Array.isArray(quizzes) ? quizzes : []).map((quiz) => {
                      const course = currentCourses.find(c => {
                        const quizCourseId = quiz.course?._id || quiz.course || quiz.courseId;
                        return c._id === quizCourseId;
                      });
                      return (
                        <option key={quiz._id} value={quiz._id}>
                          {quiz.title} - {course?.title || quiz.course?.title || 'Unknown Course'}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Question Text *</label>
                  <textarea
                    rows={3}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="form-input"
                    placeholder="Enter your question here..."
                  />
                </div>
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="form-group">
                    <label>Option {index + 1} *</label>
                    <input
                      type="text"
                      value={formData.options[index]}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      required
                      className="form-input"
                      placeholder={`Enter option ${index + 1}`}
                    />
                  </div>
                ))}
                <div className="form-group">
                  <label>Correct Answer *</label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData({ ...formData, correctAnswer: Number(e.target.value) })
                    }
                    required
                    className="form-input"
                  >
                    {formData.options.map((opt, i) => (
                      <option key={i} value={i} disabled={!opt.trim()}>
                        Option {i + 1}: {opt || `(Empty)`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="course-actions">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Saving...' : editingQuestion ? 'Update' : 'Create'} Question
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}