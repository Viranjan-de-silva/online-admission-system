import React, { useState } from 'react';
import './StdForm.css';

const StdForm = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [values, setValues] = useState({
    firstname: '',
    lastname: '',
    email: '',
    grade: '',
    gender: '',
    birthday: '',
    activities: [],
    image: '',
  });
  

  // Allowed file types
  const allowedFileTypes = [
    'application/pdf',                                                    // PDF
    'application/msword',                                                // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  // DOCX
  ];

  const handleChanges = (e) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine all form data including image and files
    const formData = {
      ...values,
      image: selectedImage,
      files: uploadedFiles
    };
    console.log(formData);
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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (allowedFileTypes.includes(file.type)) {
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          file: file,
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`The following files are not allowed: ${invalidFiles.join(', ')}\nPlease upload only PDF, DOC, or DOCX files.`);
    }

    if (validFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...validFiles]);
    }

    event.target.value = "";
  };

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

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
        
        <fieldset>
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
              <ul>
                {uploadedFiles.map(file => (
                  <li key={file.id}>
                    <span>
                      {getFileTypeIcon(file.type)} {file.name} ({file.size})
                    </span>
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