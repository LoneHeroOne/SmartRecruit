import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Services/apiClient';
import './AdminApplications.css';

interface Application {
  id: number;
  score: number | null;
  applied_at: string;
  status: string | null;
  full_name: string | null;
  phone_number: string | null;
  education_level: string | null;
  years_experience: number | null;
  linkedin_url: string | null;
  cover_letter: string | null;
  job_title: string | null;
  user_email: string | null;
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { state: { message: 'Please log in to access admin panel.' } });
      return;
    }

    fetchApplications();
  }, [navigate]);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/');
      setApplications(response.data);
    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      alert('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: number, newStatus: string) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, {
        status: newStatus
      });
      alert(`Application status updated successfully!`);

      // Refresh the applications list
      fetchApplications();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert('Failed to update application status. Please try again.');
    }
  };

  const filteredApplications = applications.filter(app =>
    app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case 'accepted':
        return 'status-badge accepted';
      case 'rejected':
        return 'status-badge rejected';
      case 'under_review':
      case 'processing':
        return 'status-badge processing';
      default:
        return 'status-badge submitted';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading applications...</div>;
  }

  return (
    <div className="admin-applications">
      <div className="admin-header">
        <h1>Admin - Job Applications</h1>
      </div>

      <div className="admin-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, job title, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="stats">
          <span>Total Applications: {applications.length}</span>
          <span>Filtered: {filteredApplications.length}</span>
        </div>
      </div>

      <div className="applications-table-container">
        <table className="applications-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Job Position</th>
              <th>Email</th>
              <th>Education</th>
              <th>Experience</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app.id}>
                <td>{app.full_name || 'N/A'}</td>
                <td>{app.job_title || 'N/A'}</td>
                <td>{app.user_email || 'N/A'}</td>
                <td>{app.education_level || 'N/A'}</td>
                <td>{app.years_experience ? `${app.years_experience} years` : 'N/A'}</td>
                <td>{formatDate(app.applied_at)}</td>
                <td>
                  <span className={getStatusBadgeClass(app.status)}>
                    {app.status || 'submitted'}
                  </span>
                </td>
                <td>
                  <select
                    value={app.status || 'submitted'}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="processing">Processing</option>
                    <option value="under_review">Under Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
