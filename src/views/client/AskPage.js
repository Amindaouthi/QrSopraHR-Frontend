import React, { useRef, useState, useEffect } from 'react';
import NewNavbar from './homeComponents/NewNavbar';
import './askpage.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
 
const AskPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const question = location.state?.question;
  const [title, setTitle] = useState(question ? question.title : '');
  const [content, setContent] = useState(question ? question.content : '');
  const [file, setFile] = useState(null);
  const [tagId, setTagId] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);
  const editor = useRef(null);
  const votreToken = localStorage.getItem('token');
  const [isAnonymous, setIsAnonymous] = useState(question ? question.userAnonymous : false);
  const [isEditMode, setIsEditMode] = useState(!!question);
  const [existingImage, setExistingImage] = useState(null);
 
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:8082/api/tags/getAll', {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        });
        setTags(response.data); // Assuming the response data is an array of tags
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);
 
 
 
  useEffect(() => {
    if (question) {
      setExistingImage(question.image);
      setSelectedTags(question.tags.map((tag) => ({ value: tag.id, label: tag.name})));
      console.log(question.tags)
    }
  }, [question]);
 
  const handleSubmit = async (event) => {
    event.preventDefault(); 
 
  
    if (!votreToken) {
      alert('Please log in to ask a question.');
      navigate('/auth/login'); 
      return;
    }
 
    
    const headers = {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${votreToken}`, 
    };
 
    const formData = new FormData();
    formData.append('questionRequest.title', title);
    formData.append('questionRequest.content', content);
    if (file) {
      formData.append('file', file);
    }
    formData.append('tagIds', selectedTags.map(tag => tag.value));
    formData.append('userAnonymous', isAnonymous);
 
    if (isEditMode) {
      // Update question
      try {
        const response = await axios.put(`http://localhost:8082/api/questions/${question.id}`, formData, { headers });
 
        if (response.status === 200) {
          await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Question updated successfully!',
          });
 
          navigate('/client/questionpage'); 
        }
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating the question. Please try again later.',
        });
      }
    } else {
      
      try {
        const response = await axios.post('http://localhost:8082/api/questions/create', formData, {
          headers: headers, // Pass the headers object to Axios
        });
        if (response.status === 200) {
          await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Question created successfully!',
          });
 
          navigate('/client/questionpage'); 
        }
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while creating the question. Please try again later.',
        });
      }
    }
  };
 
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
 
  const handleTagChange = (selectedOptions) => {
    setSelectedTags(selectedOptions);
  };
 
  return (
    <>
      <NewNavbar />
      <div style={{ marginTop: 100 }}>
        <div className="container mb-5" style={{ width: '70%', display: 'block', margin: 'auto' }}>
          <div className="card mt-5" style={{ backgroundColor: 'hsl(206,100%,97%)' }}>
            <div className="card-header">
              <h3>
                <b>{isEditMode ? 'Update Question' : 'Ask a Public Question'}</b>
              </h3>
            </div>
            <div className="card-body">
              <h5 className="card-title">Writing a Good Question</h5>
              <p className="card-text">
                You’re ready to ask a programming-related question and this form will help guide you
                through the process.
              </p>
              <h5>Steps</h5>
              <ul>
                <li>Summarize your problem in a one-line title.</li>
                <li>Describe your problem in more detail.</li>
                <li>Describe what you tried and what you expected to happen.</li>
                <li>Add “tags” which help surface your question to members of the community.</li>
                <li>You can add a question as Anonyme.</li>
              </ul>
            </div>
          </div>
          <form id="question-form" onSubmit={handleSubmit}>
            <div className="card mb-3 mt-5">
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="exampleInputEmail1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-control"
                  />
                </div>
 
                <div className="form-group">
                  <label htmlFor="exampleInputEmail1">Subject</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-control"
                  />
                </div>
 
                <div className="form-group">
                  <label htmlFor="exampleInputEmail1">Add file</label>
                  {existingImage && (
                    <div>
                      <img src={existingImage} alt="Existing image" style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '10px' }} />
                    </div>
                  )}
                  <input
                  id ="exampleInputEmail1"
                    type="file"
                    onChange={handleFileChange}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
 
            <div className="card mt-3">
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="exampleInputTags">Question Tags</label>
 
                  <Select
                    value={selectedTags}
                    onChange={handleTagChange}
                    options={tags.map((tag) => ({ value: tag.id, label: tag.name}))}
                    isMulti={true}
                    placeholder="Select tags"
                  />
 
                  <small id="emailHelp" className="form-text text-muted">
                    Enter Question Tags
                  </small>
                </div>
              </div>
            </div>
            <div className="form-group form-check" style={{ marginTop: '30px' }}>
              <input
                type="checkbox"
                className="form-check-input"
                id="anonymousCheckbox"
                checked={isAnonymous}
                style={{ backgroundColor: 'red', borderColor: 'white' }}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="anonymousCheckbox">
                <FontAwesomeIcon icon={faUserSecret} style={{ marginLeft: '5px' ,marginTop:"8px",marginRight: '5px'}} />
                Rester anonyme
              </label>
            </div>
 
            <button type="submit" className="btn btn-danger custom-btn mt-5 mb-5">
              {isEditMode ? 'Update Question' : 'Ask Question'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
 
export default AskPage;