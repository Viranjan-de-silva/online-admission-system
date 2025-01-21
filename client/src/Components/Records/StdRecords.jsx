import React, { useEffect, useState } from 'react';
import './StdRecords.css';
import StudentEditModal from '../EditForm/StdEditForm';

function StdRecords() {
    // State to store the list of students
    const [students, setStudents] = useState([]);
    // State to handle loading state
    const [loading, setLoading] = useState(true);
    // State to handle errors
    const [error, setError] = useState(null);
    // State to track the ID of the student being edited
    const [editingStudentId, setEditingStudentId] = useState(null);
    // State to store the data of the student being edited
    const [editingStudentData, setEditingStudentData] = useState(null);

    // Fetch all student records when the component is mounted
    useEffect(() => {
        fetch('http://127.0.0.1:5000/api/students/all')
            .then(response => response.json())
            .then(data => {
                // Check if the response is valid and contains an array
                if (Array.isArray(data)) {
                    setStudents(data); // Store the data in the state
                } else {
                    setError('Error fetching students: Invalid response format');
                }
                setLoading(false); // Set loading to false after fetching data
            })
            .catch(() => {
                setError('Error fetching student records'); // Handle fetch errors
                setLoading(false);
            });
    }, []);

    // Function to delete a student by their ID
    const deleteStudent = (id) => {
        fetch(`http://127.0.0.1:5000/api/students/delete/${id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the deleted student from the state
                    setStudents(prevStudents => prevStudents.filter(student => student.id !== id));
                } else {
                    setError(`Error deleting student: ${data.message}`);
                }
            })
            .catch(() => setError('Error deleting student')); // Handle fetch errors
    };

    // Function to fetch the data of a single student for editing
    const fetchStudentById = (id) => {
        fetch(`http://127.0.0.1:5000/api/students/all${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setEditingStudentData(data.student); // Store the fetched student data in state
                } else {
                    setError(`Error fetching student: ${data.message}`);
                }
            })
            .catch(() => setError('Error fetching student data')); // Handle fetch errors
    };

    // Handle the "Edit" button click by setting the ID and fetching data
    const handleEditClick = (studentId) => {
        setEditingStudentId(studentId); // Track the ID of the student being edited
    };

    // Refresh the student data after updates
    const refreshStudentData = () => {
        fetch('http://127.0.0.1:5000/api/students/all')
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setStudents(data); // Update the state with refreshed data
                } else {
                    setError('Error fetching students: Invalid response format');
                }
            })
            .catch(() => setError('Error fetching student records')); // Handle fetch errors
    };

    // Show a loading indicator if the data is being fetched
    if (loading) {
        return <div className="loader"></div>;
    }

    // Display an error message if an error occurs
    if (error) {
        return <div className="no-data-message">{error}</div>;
    }

    return (
        <div className="std-records-container">
            <h2>Student Records</h2>
            {students.length === 0 ? (
                // Display a message if no student records are found
                <div className="no-data-message">No student records found.</div>
            ) : (
                <table className="std-records-table">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Grade</th>
                            <th>Gender</th>
                            <th>Birthday</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <React.Fragment key={student.id}>
                                <tr>
                                    <td>{student.firstname}</td>
                                    <td>{student.lastname}</td>
                                    <td>{student.email}</td>
                                    <td>{student.grade}</td>
                                    <td>{student.gender}</td>
                                    <td>{new Date(student.birthday).toLocaleDateString()}</td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditClick(student.id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => deleteStudent(student.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {/* Render the Edit Modal for the selected student */}
                                {editingStudentId === student.id && (
                                    <tr>
                                        <td colSpan="7">
                                            <StudentEditModal
                                                show={editingStudentId === student.id}
                                                onClose={() => {
                                                    setEditingStudentId(null); // Close the modal
                                                    refreshStudentData(); // Refresh the student data
                                                }}
                                                studentId={student.id}
                                                initialData={student} // Pass the student's data
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default StdRecords;
