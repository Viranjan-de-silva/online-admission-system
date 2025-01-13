import React, { useState } from 'react';
import axios from 'axios';
import './StdForm.css';

const StdForm = () => {
  const [selectedImage, setSelectedImage] = useState(null); // State for handling the uploaded image
  const [uploadedFiles, setUploadedFiles] = useState([]); // State for handling the list of uploaded files
  const [values, setValues] = useState({ // State for handling form input values
    firstname: '',
    lastname: '',
    email: '',
    grade: '',
    gender: '',
    birthday: '',
    activities: [],
    image: '',
  });

  // Add this to your state declarations at the top of the component
  const [fileStats, setFileStats] = useState({
    accepted: 0,
    rejected: 0,
    processing: 0
  });

  // Allowed file types
  const allowedFileTypes = [
    'application/pdf',                                                    // PDF
    'application/msword',                                                // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  // DOCX
  ];

  const handleChanges = (e) => { // Handles changes in form inputs
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setValues((prevValues) => {
        const updatedActivities = checked
          ? [...(prevValues[name] || []), value]
          : (prevValues[name] || []).filter((activity) => activity !== value);
        
        return { ...prevValues, [name]: updatedActivities };
      });
    } else {
      setValues({ ...values, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData object for file uploads
      const formData = new FormData();
      
      // Add student details
      formData.append('firstname', values.firstname);
      formData.append('lastname', values.lastname);
      formData.append('email', values.email);
      formData.append('grade', values.grade);
      formData.append('gender', values.gender);
      formData.append('birthday', values.birthday);
      formData.append('activities', JSON.stringify(values.activities));
      
      // Add profile image if exists
      if (selectedImage?.file) {
        formData.append('profile_image', selectedImage.file);
      }
      
      // Add documents
      uploadedFiles.forEach(file => {
        formData.append('documents', file.file);
      });

      // First, submit student details
      const studentResponse = await axios.post('http://127.0.0.1:5000/api/students/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (studentResponse.data.success) {
        alert('Student information submitted successfully!');
        // Reset form
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  // Function to reset form values
  const resetForm = () => {
    setValues({
      firstname: '',
      lastname: '',
      email: '',
      grade: '',
      gender: '',
      birthday: '',
      activities: [],
      image: '',
    });
    setSelectedImage(null);
    setUploadedFiles([]);
    setFileStats({
      accepted: 0,
      rejected: 0,
      processing: 0
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage({
        url: imageUrl,
        file: file
      });
    }
    event.target.value = ""; // Reset input
  };

  const handleDeleteImage = () => {
    if (selectedImage?.url) {
      URL.revokeObjectURL(selectedImage.url); // Clean up URL object
    }
    setSelectedImage(null);
  };

  // HandleFileUpload function to initialize files as processing
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const invalidFiles = [];
    const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB in bytes

    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (exceeds 16MB)`);
      } else if (allowedFileTypes.includes(file.type)) {
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          file: file,
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type,
          status: 'processing'
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`The following files are not allowed: ${invalidFiles.join(', ')}\nPlease upload only PDF, DOC, or DOCX files under 16MB.`);
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setFileStats(prev => ({
        ...prev,
        processing: prev.processing + validFiles.length
      }));
    }

    event.target.value = "";
  };

  // Function to delete a file from the uploaded files list
  const handleDeleteFile = (fileId) => {
    setUploadedFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file.id !== fileId); // Remove file from list
      
      // Recalculate all stats after deletion
      const newStats = {
        accepted: updatedFiles.filter(f => f.status === 'accepted').length,
        rejected: updatedFiles.filter(f => f.status === 'rejected').length,
        processing: updatedFiles.filter(f => f.status === 'processing').length
      };
  
      setFileStats(newStats);
      return updatedFiles;
    });
  };
  
  // Function to get file type icon based on MIME type
  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'application/pdf':
        return '📄 PDF';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '📝 DOC';
      default:
        return '📄';
    }
  };

  // Handle file status changes (accepted, rejected, processing)
  const handleFileAcceptance = (fileId, newStatus) => {
    setUploadedFiles(prevFiles => {
      const updatedFiles = prevFiles.map(file => {
        if (file.id === fileId) {
          return { ...file, status: newStatus };
        }
        return file;
      });
  
      // Recalculate all stats based on current files
      const newStats = {
        accepted: updatedFiles.filter(f => f.status === 'accepted').length,
        rejected: updatedFiles.filter(f => f.status === 'rejected').length,
        processing: updatedFiles.filter(f => f.status === 'processing').length
      };
  
      setFileStats(newStats);
      return updatedFiles;
    });
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Student admission form</h1>
        
        <h2>Student details Section</h2>  {/* Student details section */}
        <hr />
        
        <label htmlFor="firstname">First Name*: </label>
        <input type="text" name="firstname" className="text" placeholder='Enter First Name' onChange={handleChanges} required/>

        <label htmlFor="lastname">Last Name*: </label>
        <input type="text" name="lastname" className="text" placeholder='Enter Last Name' onChange={handleChanges} required/>

        <label htmlFor="email">Email*: </label>
        <input type="email" name="email" className="text" placeholder='Enter email' onChange={handleChanges} required/>

        <label htmlFor='grade'>Grade: </label>
        <select name="grade" id="subject" onChange={handleChanges}>
          <option value="">None</option>
          <option value="grade1">Grade 01</option>
          <option value="grade2">Grade 02</option>
          <option value="grade3">Grade 03</option>
        </select>

        <label htmlFor='gender'>Gender: </label> 
        <input type='radio' name='gender' value="male" onChange={handleChanges}/> Male
        <input type='radio' name='gender' value="female" onChange={handleChanges}/> Female
        <input type='radio' name='gender' value="other" onChange={handleChanges}/> Other

        <label htmlFor="datePicker">Date of birth: </label>
        <input type="date" id="datePicker" name="birthday" onChange={handleChanges}/>
        
        <fieldset> {/* Extracurricular activities section */}
          <legend>Extracurricular Activities:</legend>
          <div>
            <input type="checkbox" id="music" name="activities" value="music" onChange={handleChanges}/>
            <label htmlFor="music">Music</label>
          </div>
          <div>
            <input type="checkbox" id="sports" name="activities" value="sports" onChange={handleChanges}/>
            <label htmlFor="sports">Sports</label>
          </div>
          <div>
            <input type="checkbox" id="art" name="activities" value="art" onChange={handleChanges}/>
            <label htmlFor="art">Art</label>
          </div>
          <div>
            <input type="checkbox" id="drama" name="activities" value="drama" onChange={handleChanges}/>
            <label htmlFor="drama">Drama</label>
          </div>
          <div>
            <input type="checkbox" id="dance" name="activities" value="dance" onChange={handleChanges}/>
            <label htmlFor="dance">Dance</label>
          </div>
        </fieldset>

        <h2>Image uploading Section</h2> {/* File upload section */}
        <hr />
        <section className="img-sec">
          <label>Upload a photograph of the candidate: </label>
          <label className="label-image">
            + Add image
            <input
              type="file"
              name="image"
              onChange={handleImageUpload}
              accept="image/png, image/jpeg, image/webp"
            />
          </label>
        </section>
        {selectedImage && (
          <div className="images">
            <div className="image">
              <img src={selectedImage.url} height="200" alt="upload" />
              <button type="button" onClick={handleDeleteImage}>Delete image</button>
            </div>
          </div>
        )}

        <section className="file-sec">
          <h2>Upload Additional Documents</h2>
          <hr />
          <div className='file-up'>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
            />
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h3>Uploaded Documents:</h3>
              <p className='arp'>
                Accepted: {fileStats.accepted}, 
                Rejected: {fileStats.rejected}, 
                Processing: {fileStats.processing}
              </p>
              <ul>
                {uploadedFiles.map(file => (
                  <li key={file.id}>
                    <span>
                      {getFileTypeIcon(file.type)} {file.name} ({file.size})
                    </span>
                    <select name="grade" id="subject" onChange={(e) => handleFileAcceptance(file.id, e.target.value)}>
                      <option value="processing">Edit</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteFile(file.id)}
                      className="delete-file"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <button type='submit'>Submit</button>
        <button 
          type='button' 
          onClick={() => {
            setValues({
              firstname: '',
              lastname: '',
              email: '',
              grade: '',
              gender: '',
              birthday: '',
              activities: [],
              image: '',
            });
            setSelectedImage(null);
            setUploadedFiles([]);
          }}
        >
          Reset
        </button>
      </form>
    </div>
  );
};

export default StdForm;