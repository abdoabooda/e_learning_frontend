import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import ChartCard from '../components/dashboard/ChartCard';
import { BookOpen, Users, FileQuestion, TrendingUp, Clock, Award } from 'lucide-react';
import { mockChartData } from '../Data/mockData';
//import { Users, BookOpen } from 'lucide-react';
import './main.css';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getUsersCount } from '../../redux/apiCalls/profileApiCall';
import { getCoursesCount } from '../../redux/apiCalls/courseApiCall';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { usersCount, loading: profileLoading, error: profileError } = useSelector((state) => state.profile);
  const { courseCount, loading: courseLoading, error: courseError } = useSelector((state) => state.course);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(getUsersCount());
      dispatch(getCoursesCount());
    }
  }, [dispatch, user]);

  // if (user?.role !== 'admin') {
  //   return (
  //     <Layout>
  //       <div className="dashboard-page">
  //         <p className="text-red-500">Access denied. Admins only.</p>
  //       </div>
  //     </Layout>
  //   );
  // }

  const stats = [
    {
      title: 'Total Users',
      value: usersCount || 0,
      icon: '👥',
    },
    {
      title: 'Total Courses',
      value: courseCount || 0,
      icon: '📚',
    },
        {
      title: 'Total revenue',
      value: courseCount || 0,
      icon: '$',
    },
  ];

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="page-header">
          <h1 className="heading">Dashboard Overview</h1>
        </div>

        {/* {(profileLoading || courseLoading) ? (
          <p>Loading stats...</p>
        ) : (profileError || courseError) ? (
          <p className="text-red-500">{profileError || courseError}</p>
        ) : (

        )} */}

          <div className="stats-grid grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </div>

      {/* Quick Actions & Recent Activity */}
      <div className="dashboard-actions-grid">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3 className="card-heading">Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-button action-blue">
              <BookOpen className="action-icon" />
              <span className="action-text">Create New Course</span>
            </button>
            <button className="action-button action-green">
              <FileQuestion className="action-icon" />
              <span className="action-text">Add New Quiz</span>
            </button>
            <button className="action-button action-purple">
              <Award className="action-icon" />
              <span className="action-text">View Student Progress</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <h3 className="card-heading">Recent Activity</h3>
          <div className="activity-list">
            {stats.recentActivity?.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-timestamp">
                    <Clock className="timestamp-icon" />
                    {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      </div>
    </Layout>
  );
};

export default Dashboard;



