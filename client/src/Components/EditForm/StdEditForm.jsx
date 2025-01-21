import React, { useState, useEffect } from 'react';

const StudentEditModal = ({ show, onClose, studentId, initialData }) => {
  // State to manage the student data in the form
  const [student, setStudent] = useState({
    firstname: '',
    lastname: '',
    email: '',
    grade: '',
    gender: '',
    birthday: '',
    activities: {
      music: false,
      art: false,
      drama: false,
    },
    profile_image: '',
    extracurricular_image: null, // Preview of the selected profile image
    file: null, // Additional file to upload
  });

  // Populate the form with initial data when the modal is shown
  useEffect(() => {
    if (initialData) {
      setStudent({
        ...student, // Preserve current state
        firstname: initialData.firstname || '',
        lastname: initialData.lastname || '',
        email: initialData.email || '',
        grade: initialData.grade || '',
        gender: initialData.gender || '',
        birthday: initialData.birthday || '',
        activities: initialData.activities || {
          music: false,
          art: false,
          drama: false,
        },
        profile_image: initialData.profile_image || '',
      });
    }
  }, [initialData]);

  // Handle changes to input fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'activities') {
      // Handle checkbox changes for extracurricular activities
      setStudent({
        ...student,
        activities: {
          ...student.activities,
          [value]: e.target.checked, // Update specific activity
        },
      });
    } else {
      // Update other input fields
      setStudent({ ...student, [name]: value });
    }
  };

  // Handle profile image changes and generate a preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setStudent({
      ...student,
      extracurricular_image: URL.createObjectURL(file), // Generate image preview
      profile_image: file, // Store the selected file
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form behavior

    const formData = new FormData(); // Create FormData for file uploads
    formData.append('firstname', student.firstname);
    formData.append('lastname', student.lastname);
    formData.append('email', student.email);
    formData.append('grade', student.grade);
    formData.append('gender', student.gender);
    formData.append('birthday', student.birthday);
    formData.append('activities', JSON.stringify(student.activities)); // Convert activities object to JSON string

    // Append files if they exist
    if (student.profile_image && student.profile_image instanceof File) {
      formData.append('profile_image', student.profile_image);
    }
    if (student.file) {
      formData.append('file', student.file);
    }

    // Send the updated data to the backend
    fetch(`http://127.0.0.1:5000/api/students/all/${studentId}`, {
      method: 'PUT',
      body: formData, // Include form data in the request body
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('Student updated successfully'); // Notify success
          onClose(); // Close the modal on success
        } else {
          alert('Error updating student'); // Handle errors
        }
      })
      .catch((error) => console.error('Error updating student:', error)); // Log any errors
  };

  // If the modal is not visible, return null
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Student</h2>
        {/* Form for editing student details */}
        <form onSubmit={handleSubmit}>
          <div>
            <label>First Name</label>
            <input type="text" name="firstname" value={student.firstname} onChange={handleChange} required />
          </div>
          <div>
            <label>Last Name</label>
            <input type="text" name="lastname" value={student.lastname} onChange={handleChange} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" value={student.email} onChange={handleChange} required />
          </div>
          <div>
            <label>Grade</label>
            <input type="text" name="grade" value={student.grade} onChange={handleChange} />
          </div>
          <div>
            <label>Gender</label>
            <select name="gender" value={student.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label>Birthday</label>
            <input type="date" name="birthday" value={student.birthday} onChange={handleChange} />
          </div>
          <div>
            <label>Extracurricular Activities</label>
            <div>
              {/* Checkbox options for activities */}
              <label>
                <input
                  type="checkbox"
                  name="activities"
                  value="music"
                  checked={student.activities.music}
                  onChange={handleChange}
                />
                Music
              </label>
              <label>
                <input
                  type="checkbox"
                  name="activities"
                  value="art"
                  checked={student.activities.art}
                  onChange={handleChange}
                />
                Art
              </label>
              <label>
                <input
                  type="checkbox"
                  name="activities"
                  value="drama"
                  checked={student.activities.drama}
                  onChange={handleChange}
                />
                Drama
              </label>
            </div>
          </div>
          <div>
            <label>Profile Image</label>
            <input type="file" onChange={handleImageChange} />
            {student.extracurricular_image && (
              <img src={student.extracurricular_image} alt="Preview" style={{ width: '100px' }} />
            )}
          </div>
          <div>
            <label>Upload File</label>
            <input
              type="file"
              onChange={(e) => setStudent({ ...student, file: e.target.files[0] })}
            />
          </div>
          <button type="submit">Update Student</button>
        </form>
      </div>
    </div>
  );
};

export default StudentEditModal;
