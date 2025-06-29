import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, PlayCircle, Clock, BookOpen } from 'lucide-react';
import { 
  createLesson, 
  updateLesson, 
  updateLessonVideo, 
  fetchAllLessons,
  fetchInstructorLessons 
} from '../../redux/apiCalls/lessonApiCall';
import { fetchCourses, fetchInstructorCourses } from '../../redux/apiCalls/courseApiCall';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import './main.css';

export default function Lessons() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { courses, instructorCourses, loading: coursesLoading } = useSelector((state) => state.course);
  const { lessons, instructorLessons, loading: lessonsLoading } = useSelector((state) => state.lesson);
  
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    duration: '',
    videoUrl: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Only allow instructors and admins
    if (!['instructor', 'admin'].includes(user.role)) {
      navigate('/unauthorized');
      return;
    }

    // Fetch data based on user role
    if (user.role === 'admin') {
      dispatch(fetchAllLessons()); // All lessons
      dispatch(fetchCourses()); // All courses
    } else if (user.role === 'instructor') {
      dispatch(fetchInstructorLessons()); // Instructor's lessons
      dispatch(fetchInstructorCourses()); // Instructor's courses
    }
  }, [dispatch, user, navigate]);

  // Get appropriate data based on role
  const getLessonsData = () => {
    if (user?.role === 'admin') {
      return lessons || [];
    } else if (user?.role === 'instructor') {
      return instructorLessons || [];
    }
    return [];
  };

  const getCoursesData = () => {
    if (user?.role === 'admin') {
      return courses || [];
    } else if (user?.role === 'instructor') {
      return instructorCourses || [];
    }
    return [];
  };

  const filteredLessons = getLessonsData().filter(lesson => {
    const matchesSearch = lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
    // Handle course filtering with multiple possible ID formats
    const matchesCourse = filterCourse === '' || (() => {
      // Get the lesson's course ID in various possible formats
      const lessonCourseId = lesson.courseId || lesson.course?._id || lesson.course?.id || lesson.course;
      
      // Convert both to strings for comparison
      const filterCourseStr = String(filterCourse);
      const lessonCourseStr = String(lessonCourseId);
      
      return lessonCourseStr === filterCourseStr;
    })();
    
    return matchesSearch && matchesCourse;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !['instructor', 'admin'].includes(user.role)) {
      setError('You do not have permission to manage lessons.');
      return;
    }

    const lessonData = {
      courseId: formData.courseId,
      title: formData.title,
      duration: formData.duration,
      videoUrl: formData.videoUrl,
    };

    try {
      if (editingLesson) {
        // Update existing lesson
        await dispatch(updateLesson(editingLesson._id, lessonData));
        
        // Update video if provided
        if (video) {
          const videoFormData = new FormData();
          videoFormData.append('video', video);
          await dispatch(updateLessonVideo(editingLesson._id, videoFormData));
        }
        setSuccess('Lesson updated successfully!');
      } else {
        // Create new lesson
        const { courseId, ...rest } = lessonData;
        const formDataToSend = new FormData();
        Object.keys(rest).forEach(key => {
        formDataToSend.append(key, rest[key]);
       });

        if (video) {
          formDataToSend.append('video', video);
        }
        
        await dispatch(createLesson(formDataToSend,courseId));
        setSuccess('Lesson created successfully!');
      }
      
      setError('');
      resetForm();
      
      // Refresh lessons based on role
      if (user.role === 'admin') {
        dispatch(fetchAllLessons());
      } else if (user.role === 'instructor') {
        dispatch(fetchInstructorLessons());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lesson.');
      setSuccess('');
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: '',
      title: '',
      duration: '',
      videoUrl: ''
    });
    setVideo(null);
    setEditingLesson(null);
    setShowModal(false);
    setError('');
    setSuccess('');
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      courseId: lesson.courseId || lesson.course?._id || '',
      title: lesson.title || '',
      description: lesson.description || '',
      duration: lesson.duration || '',
      videoUrl: lesson.videoUrl.url || ''
    });
    setVideo(null);
    setShowModal(true);
  };

  const handleDelete = async (lessonId) => {
    if (!user || !['instructor', 'admin'].includes(user.role)) {
      setError('You do not have permission to delete lessons.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        //await dispatch(deleteLesson(lessonId));
        setSuccess('Lesson deleted successfully!');
        setError('');
        
        // Refresh lessons based on role
        if (user.role === 'admin') {
          dispatch(fetchAllLessons());
        } else if (user.role === 'instructor') {
          dispatch(fetchInstructorLessons());
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete lesson.');
        setSuccess('');
      }
    }
  };

  const getCourseTitle = (lesson) => {
    const coursesData = getCoursesData();
    
    // Get the lesson's course ID in various possible formats
    const lessonCourseId = lesson.courseId || lesson.course?._id || lesson.course?.id || lesson.course;
    
    // If lesson has populated course object with title
    if (lesson.course && typeof lesson.course === 'object' && lesson.course.title) {
      return lesson.course.title;
    }
    
    // Find course by ID (handle both _id and id formats)
    const course = coursesData.find(c => {
      const courseId = c._id || c.id;
      return String(courseId) === String(lessonCourseId);
    });
    
    return course ? course.title : 'Unknown Course';
  };

  const getPageTitle = () => {
    return user?.role === 'admin' ? 'All Lessons' : 'My Lessons';
  };

  if (!user) return null;

  // Unauthorized access
  if (!['instructor', 'admin'].includes(user.role)) {
    return (
      <Layout>
        <div className="unauthorized-access">
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  const isLoading = lessonsLoading || coursesLoading;

  return (
    <Layout>
      <div className="courses-page">
        <div className="page-header">
          <h1 className="heading">{getPageTitle()}</h1>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            disabled={isLoading}
          >
            <Plus className="icon" />
            Add Lesson
          </Button>
        </div>

        {/* Messages */}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Filters */}
        <div className="course-actions">
          <div className="form-group">
            <label htmlFor="search" className="sr-only">Search lessons</label>
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                id="search"
                placeholder="Search lessons..."
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
              {getCoursesData().map(course => (
                <option key={course._id || course.id} value={course._id || course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <p>Loading lessons...</p>
          </div>
        )}

        {/* Lessons List */}
        {!isLoading && (
          <div className="card">
            <div className="card-header">
              <h3 className="heading">
                {user.role === 'admin' ? 'All Lessons' : 'My Lessons'} ({filteredLessons.length})
              </h3>
            </div>
            <div className="lesson-list">
              {filteredLessons.map((lesson) => (
                <div key={lesson._id || lesson.id} className="lesson-item">
                  <div className="lesson-content">
                    <div className="lesson-title">
                      <PlayCircle className="icon text-blue" />
                      <h4 className="heading">{lesson.title}</h4>
                      <span className="badge badge-order">Order {lesson.order}</span>
                    </div>
                    <p className="text-secondary">{lesson.description}</p>
                    <div className="lesson-meta">
                      <div className="meta-item">
                        <BookOpen className="icon" />
                        {getCourseTitle(lesson)}
                      </div>
                      <div className="meta-item">
                        <Clock className="icon" />
                        {lesson.duration}
                      </div>
                    </div>
                    {lesson.videoUrl && (
                      <div className="text-blue">
                        <PlayCircle className="icon" />
                        Video Available
                      </div>
                    )}
                    {lesson.video && (
                      <div className="text-blue">
                        <PlayCircle className="icon" />
                        Video: {lesson.videoUrl.url || 'Uploaded'}
                      </div>
                    )}
                  </div>
                  <div className="course-actions">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(lesson)}
                      title="Edit Lesson"
                    >
                      <Edit2 className="icon" />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(lesson._id || lesson.id)}
                      title="Delete Lesson"
                    >
                      <Trash2 className="icon" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredLessons.length === 0 && !isLoading && (
                <div className="empty-state">
                  <PlayCircle className="icon-large text-gray" />
                  <p className="text-secondary">
                    {user.role === 'admin' 
                      ? "No lessons found. Try adjusting your search or filters."
                      : "You haven't created any lessons yet. Create your first lesson to get started."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for Create/Edit Lesson */}
        {showModal && (
          <div className="modal-overlay">
            <div className="course-form-container modal-content">
              <h2 className="heading">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h2>
              
              <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group">
                  <label htmlFor="courseId">Course</label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select a course</option>
                    {getCoursesData().map(course => (
                      <option key={course._id || course.id} value={course._id || course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                
                
                <div className="form-group grid grid-cols-2">
                  <div className="form-group">
                    <label htmlFor="duration">Duration</label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      placeholder="e.g., 45 min"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>

                </div>
                
                <div className="form-group">
                  <label htmlFor="videoUrl">Video URL (optional)</label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="video">Upload Video (optional)</label>
                  <input
                    type="file"
                    id="video"
                    name="video"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="form-input"
                  />
                  {editingLesson && editingLesson.video && (
                    <p className="text-secondary text-sm">
                      Current video: {editingLesson.video.url || 'Uploaded'}
                    </p>
                  )}
                </div>
                
                
                <div className="course-actions">
                  <Button type="submit" variant="primary">
                    {editingLesson ? 'Update Lesson' : 'Create Lesson'}
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