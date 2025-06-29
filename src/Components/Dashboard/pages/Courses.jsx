import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchUserCourses,
  fetchCourses,
  createCourse,
  updateCourse,
  updateCourseImage,
  fetchInstructorCourses, 
} from '../../redux/apiCalls/courseApiCall';
import Layout from '../components/layout/Layout';
import CourseCard from '../components/courses/CourseCard';
import Button from '../components/common/Button';
import './main.css';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const Courses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { userCourses, courses, instructorCourses, loading } = useSelector((state) => state.course);
  
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    price: '',
    description: '',
    category: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch courses based on user role
    switch (user.role) {
      case 'student':
        dispatch(fetchUserCourses()); // Enrolled courses
        break;
      case 'instructor':
        dispatch(fetchInstructorCourses()); // Instructor's own courses
        break;
      case 'admin':
        dispatch(fetchCourses()); // All courses
        break;
      default:
        break;
    }
  }, [dispatch, user, navigate]);

  // Get appropriate courses based on role
  const getCoursesData = () => {
    switch (user?.role) {
      case 'student':
        return userCourses || [];
      case 'instructor':
        return instructorCourses || [];
      case 'admin':
        return courses || [];
      default:
        return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !['instructor', 'admin'].includes(user.role)) {
      setError('Only instructors or admins can manage courses.');
      return;
    }

    const courseData = {
      title: formData.title,
      duration: formData.duration,
      price: formData.price,
      description: formData.description,
      category: formData.category
    };

    try {
      if (editingCourse) {
        // Update existing course
        await dispatch(updateCourse(courseData,editingCourse._id));
        
        // Update image if provided
        if (image) {
          const imageFormData = new FormData();
          imageFormData.append('image', image);
          await dispatch(updateCourseImage(imageFormData,editingCourse._id));
        }
        setSuccess('Course updated successfully!');
      } else {
        // Create new course
        const formDataToSend = new FormData();
        Object.keys(courseData).forEach(key => {
          formDataToSend.append(key, courseData[key]);
        });
        if (image) {
          formDataToSend.append('image', image);
        }
        
        await dispatch(createCourse(formDataToSend));
        setSuccess('Course created successfully!');
      }
      
      setError('');
      resetForm();
      
      // Refresh courses based on role
      if (user.role === 'instructor') {
        dispatch(fetchInstructorCourses());
      } else if (user.role === 'admin') {
        dispatch(fetchCourses());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course.');
      setSuccess('');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      duration: course.duration,
      price: course.price,
      description: course.description,
      category: course.category
    });
    setImage(null);
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (!user || !['instructor', 'admin'].includes(user.role)) {
      setError('You do not have permission to delete courses.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
     //   await dispatch(deleteCourse(courseId));
        setSuccess('Course deleted successfully!');
        setError('');
        
        // Refresh courses based on role
        if (user.role === 'instructor') {
          dispatch(fetchInstructorCourses());
        } else if (user.role === 'admin') {
          dispatch(fetchCourses());
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete course.');
        setSuccess('');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      duration: '',
      price: '',
      description: '',
      category: '',
    });
    setImage(null);
    setEditingCourse(null);
    setShowModal(false);
    setError('');
    setSuccess('');
  };

  // Filter courses based on search and level
  const getFilteredCourses = () => {
    const coursesData = getCoursesData();
    
    return coursesData.filter(item => {
      // Handle different data structures based on role
      const course = user?.role === 'student' ? item.course : item;
      
      if (!course) return false;
      
      const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesLevel = filterLevel === '' || course.level === filterLevel;
      return matchesSearch && matchesLevel;
    });
  };

  const getPageTitle = () => {
    switch (user?.role) {
      case 'student':
        return 'My Enrolled Courses';
      case 'instructor':
        return 'My Courses';
      case 'admin':
        return 'All Courses';
      default:
        return 'Courses';
    }
  };

  const canManageCourses = () => {
    return user && ['instructor', 'admin'].includes(user.role);
  };

  if (!user) return null;

  const filteredCourses = getFilteredCourses();

  return (
    <Layout>
      <div className="courses-page">
        <div className="page-header">
          <h1 className="heading">{getPageTitle()}</h1>
          {canManageCourses() && (
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
            >
              <Plus className="icon" />
              Add Course
            </Button>
          )}
        </div>

        {/* Messages */}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Filters */}
        <div className="course-actions">
          <div className="form-group">
            <label htmlFor="search" className="sr-only">Search courses</label>
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                id="search"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input search-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="levelFilter" className="sr-only">Filter by level</label>
            <select
              id="levelFilter"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="form-input"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {/* {loading && (
          <div className="loading-state">
            <p>Loading courses...</p>
          </div>
        )} */}

        {/* Courses Grid */}
        {!loading && (
          <div className="grid grid-cols-3">
            {filteredCourses.map(item => {
              // Handle different data structures
              const course = user.role === 'student' ? item.course : item;
              const itemId = user.role === 'student' ? item._id : course._id;
              
              return (
                <div key={itemId} className="card">
                  <CourseCard course={course} />
                  {canManageCourses() && (
                    <div className="course-actions">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(course)}
                        title="Edit Course"
                      >
                        <Edit2 className="icon" />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(course._id)}
                        title="Delete Course"
                      >
                        <Trash2 className="icon" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {filteredCourses.length === 0 && !loading && (
              <div className="empty-state">
                <img src="https://via.placeholder.com/48" alt="No courses" className="icon-large" />
                <p className="text-secondary">
                  {user.role === 'student' 
                    ? "You haven't enrolled in any courses yet."
                    : user.role === 'instructor'
                    ? "You haven't created any courses yet."
                    : "No courses found. Try adjusting your search or filters."
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal for Create/Edit Course */}
        {showModal && canManageCourses() && (
          <div className="modal-overlay">
            <div className="course-form-container modal-content">
              <h2 className="heading">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              
              <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group">
                  <label htmlFor="title">Course Title</label>
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
                
                <div className="form-group">
                  <label htmlFor="description">Course Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="duration">Duration (e.g., 10h)</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="image">Course Image {editingCourse ? '(Optional)' : ''}</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-input"
                  />
                  {editingCourse && (
                    <p className="text-secondary text-sm">
                      Current image: {editingCourse.courseImg?.url || 'None'}
                    </p>
                  )}
                </div>
                
                <div className="course-actions">
                  <Button type="submit" variant="primary">
                    {editingCourse ? 'Update Course' : 'Create Course'}
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
};

export default Courses;