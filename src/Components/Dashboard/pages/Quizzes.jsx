import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './main.css'
import { Plus, Search, Edit2, Trash2, FileQuestion, Clock, Target, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  createQuiz,
  updateQuiz,
  fetchQuizzes,
} from '../../redux/apiCalls/lessonApiCall';

import { 
  fetchUserCourses,
  fetchCourses,
  fetchInstructorCourses, 
} from '../../redux/apiCalls/courseApiCall';

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Quizzes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { userCourses, courses, instructorCourses, loading: courseLoading } = useSelector((state) => state.course);
  const { quizzes, quiz, loading: quizLoading } = useSelector((state) => state.lesson);
  
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [quizzesLoaded, setQuizzesLoaded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    course: '',
    title: '',
    description: '',
    duration: 30,
    passingScore: 70,
  });

  // Get available courses based on user role
  const getAvailableCourses = () => {
    if (user?.role === 'instructor') {
      return instructorCourses || [];
    } else if (user?.role === 'student') {
      return userCourses || [];
    }
    return courses || [];
  };

  // Fetch all data on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      if (!dataLoaded && user) {
        try {
          // Fetch courses based on user role
          if (user.role === 'instructor') {
            await dispatch(fetchInstructorCourses());
          } else if (user.role === 'student') {
            await dispatch(fetchUserCourses());
          } else {
            await dispatch(fetchCourses());
          }
          
          setDataLoaded(true);
        } catch (error) {
          console.error('Error loading courses:', error);
          setError('Failed to load courses.');
        }
      }
    };

    loadData();
  }, [dispatch, user, dataLoaded, navigate]);

  // Fetch all quizzes after courses are loaded
  useEffect(() => {
    const loadAllQuizzes = async () => {
      if (dataLoaded && !quizzesLoaded) {
        try {
          const availableCourses = getAvailableCourses();
          
          if (availableCourses && availableCourses.length > 0) {
            console.log('Loading quizzes for courses:', availableCourses.map(c => c.id || c._id || c.courseId));
            
            // Fetch quizzes for each course sequentially
            for (const course of availableCourses) {
              const courseId = course.id || course._id || course.courseId;
              
              if (courseId) {
                try {
                  console.log(`Fetching quizzes for course: ${courseId} (${course.title || 'No title'})`);
                  await dispatch(fetchQuizzes(courseId));
                  await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                  console.error(`Error fetching quizzes for course ${courseId}:`, error);
                }
              } else {
                console.warn('Course object missing ID property:', course);
              }
            }
            
            setQuizzesLoaded(true);
          } else {
            console.log('No courses available to load quizzes from');
            setQuizzesLoaded(true);
          }
        } catch (error) {
          console.error('Error loading all quizzes:', error);
          setError('Failed to load quizzes.');
          setQuizzesLoaded(true);
        }
      }
    };

    loadAllQuizzes();
  }, [dispatch, dataLoaded, quizzesLoaded]);

  // Reset quizzes loaded when courses change
  useEffect(() => {
    if (dataLoaded) {
      setQuizzesLoaded(false);
    }
  }, [instructorCourses, userCourses, courses]);

  // Filter quizzes based on search and course filter
  const filteredQuizzes = quizzes?.filter(quiz => {
    const matchesSearch = quiz.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle course filtering with multiple possible ID formats
    const matchesCourse = filterCourse === '' || (() => {
      // Get the quiz's course ID in various possible formats
      const quizCourseId = quiz.courseId || quiz.course?._id || quiz.course?.id || quiz.course;
      
      // Convert both to strings for comparison
      const filterCourseStr = String(filterCourse);
      const quizCourseStr = String(quizCourseId);
      
      return quizCourseStr === filterCourseStr;
    })();
    
    return matchesSearch && matchesCourse;
  }) || [];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? Number(value) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseId) {
      setError('Please select a course');
      return;
    }
    
    const quizData = {
      course: formData.course,
      title: formData.title,
      description: formData.description,
      duration: formData.duration,
      passingScore: formData.passingScore,
    };
    
    try {
      if (editingQuiz) {
        // Update existing quiz
        await dispatch(updateQuiz(quizData, editingQuiz.id || editingQuiz._id));
        setSuccess('Quiz updated successfully!');
      } else {
        // Create new quiz
        await dispatch(createQuiz(quizData, formData.courseId));
        setSuccess('Quiz created successfully!');
      }
      
      setError('');
      
      // Refresh quizzes for the specific course after create/update
      await dispatch(fetchQuizzes(formData.courseId));
      
      resetForm();
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError(error.response?.data?.message || 'Failed to save quiz. Please try again.');
      setSuccess('');
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: '',
      title: '',
      description: '',
      duration: 30,
      passingScore: 70,
    });
    setEditingQuiz(null);
    setShowModal(false);
    setError('');
    setSuccess('');
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      course: quiz.courseId || quiz.course?._id || '',
      title: quiz.title || '',
      description: quiz.description || '',
      duration: quiz.duration || 30,
      passingScore: quiz.passingScore || 70,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        // Find the quiz to get its courseId before deletion
        const quizToDelete = quizzes.find(q => (q.id || q._id) === id);
        
        if (!quizToDelete) {
          setError('Quiz not found');
          return;
        }
        
        // Uncomment when deleteQuiz is available
        // await dispatch(deleteQuiz(id));
        setSuccess('Quiz deleted successfully!');
        setError('');
        
        // Refresh quizzes for that specific course after delete
        if (quizToDelete.courseId) {
          await dispatch(fetchQuizzes(quizToDelete.courseId));
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
        setError(error.response?.data?.message || 'Failed to delete quiz. Please try again.');
        setSuccess('');
      }
    }
  };

  const getCourseTitle = (courseId) => {
    if (!courseId) return 'Unknown Course';
    
    const availableCourses = getAvailableCourses();
    const course = availableCourses.find(c => 
      c.id === courseId || c._id === courseId || c.courseId === courseId
    );
    return course ? course.title : 'Unknown Course';
  };

  const toggleQuizStatus = async (id) => {
    try {
      const quiz = quizzes.find(q => (q.id || q._id) === id);
      if (!quiz) {
        setError('Quiz not found');
        return;
      }
      
      if (!quiz.courseId) {
        setError('Quiz courseId is missing');
        return;
      }
      
      // Update quiz status
      const updatedData = { ...quiz, isActive: !quiz.isActive };
      await dispatch(updateQuiz(updatedData, id));
      setSuccess(`Quiz ${quiz.isActive ? 'deactivated' : 'activated'} successfully!`);
      setError('');
      
      // Refresh quizzes for that specific course after update
      await dispatch(fetchQuizzes(quiz.courseId));
    } catch (error) {
      console.error('Error updating quiz status:', error);
      setError(error.response?.data?.message || 'Failed to update quiz status. Please try again.');
      setSuccess('');
    }
  };

  const availableCourses = getAvailableCourses();

  // Show loading state
  if ((courseLoading || quizLoading || !quizzesLoaded) && !dataLoaded) {
    return (
      <Layout>
        <div className="courses-page">
          <div className="flex justify-center items-center h-64">
            <p>Loading quizzes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="courses-page">
        <div className="page-header">
          <h1 className="heading">Quizzes</h1>
          {availableCourses.length > 0 && (
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              disabled={courseLoading || quizLoading}
            >
              <Plus className="icon" />
              Add Quiz
            </Button>
          )}
        </div>

        {/* Messages */}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {availableCourses.length === 0 ? (
          <div className="empty-state">
            <FileQuestion className="icon-large text-gray" />
            <p className="text-secondary">No courses available. You need to have courses before creating quizzes.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="course-actions">
              <div className="form-group">
                <label htmlFor="search" className="sr-only">Search quizzes</label>
                <div className="search-container">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    id="search"
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input search-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="courseFilter" className="sr-only">Filter by course</label>
                <select
                  id="courseFilter"
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Courses</option>
                  {availableCourses.map(course => {
                    const courseId = course.id || course._id || course.courseId;
                    return (
                      <option key={courseId} value={courseId}>{course.title}</option>
                    );
                  })}
                </select>
              </div>
              {filterCourse && (
                <Button
                  variant="secondary"
                  onClick={() => setFilterCourse('')}
                >
                  Clear Filter
                </Button>
              )}
            </div>

            {/* Quizzes Grid */}
            <div className="grid grid-cols-3">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id || quiz._id} className="card quiz-card">
                  <div className="quiz-content">
                    <div className="flex justify-between mb-4">
                      <h3 className="heading">{quiz.title}</h3>
                      <div className="course-actions">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(quiz)}
                          title="Edit Quiz"
                        >
                          <Edit2 className="icon" />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(quiz.id || quiz._id)}
                          title="Delete Quiz"
                        >
                          <Trash2 className="icon" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-secondary">{quiz.description}</p>
                    <div className="quiz-meta">
                      <div className="meta-item">
                        <FileQuestion className="icon" />
                        Course: {getCourseTitle(quiz.courseId || quiz.course)}
                      </div>
                      <div className="meta-item">
                        <Clock className="icon" />
                        {quiz.duration} minutes
                      </div>
                      <div className="meta-item">
                        <Target className="icon" />
                        Passing score: {quiz.passingScore}%
                      </div>
                      <div className="meta-item">
                        <Users className="icon" />
                        {quiz.attempts || 0} attempts
                      </div>
                    </div>
                    <div className="quiz-footer">
                      <span className={`badge ${quiz.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        variant={quiz.isActive ? 'danger' : 'success'}
                        onClick={() => toggleQuizStatus(quiz.id || quiz._id)}
                      >
                        {quiz.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                    <div className="text-secondary text-sm">
                      {quiz.questions?.length || 0} questions • Created {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown date'}
                    </div>
                  </div>
                </div>
              ))}
              {filteredQuizzes.length === 0 && quizzesLoaded && (
                <div className="empty-state">
                  <FileQuestion className="icon-large text-gray" />
                  <p className="text-secondary">No quizzes found. Create your first quiz to get started.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal for Create/Edit Quiz */}
        {showModal && (
          <div className="modal-overlay">
            <div className="course-form-container modal-content">
              <h2 className="heading">{editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}</h2>
              
              <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group">
                  <label htmlFor="course">Course *</label>
                  <select
                    id="courseId"
                    name="course"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select a course</option>
                    {availableCourses.map(course => {
                      const courseId = course.id || course._id || course.courseId;
                      return (
                        <option key={courseId} value={courseId}>{course.title}</option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Enter quiz title"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input"
                    rows="3"
                    placeholder="Enter quiz description (optional)"
                  />
                </div>
                
                <div className="form-group grid grid-cols-2">
                  <div className="form-group">
                    <label htmlFor="duration">Duration (minutes) *</label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      min="1"
                      max="300"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="passingScore">Passing Score (%) *</label>
                    <input
                      type="number"
                      id="passingScore"
                      name="passingScore"
                      min="0"
                      max="100"
                      value={formData.passingScore}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="course-actions">
                  <Button type="submit" variant="primary" disabled={quizLoading}>
                    {quizLoading ? 'Saving...' : (editingQuiz ? 'Update Quiz' : 'Create Quiz')}
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