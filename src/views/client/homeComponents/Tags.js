import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './sidebar';
import NewNavbar from './NewNavbar';
import '../homeComponents/Tags.css';
import Swal from 'sweetalert2';
import '../homeComponents/swal.css';
import { FaTrash, FaEdit } from 'react-icons/fa'; 
import Darkmode from 'darkmode-js';
import { useTranslation} from 'react-i18next';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [expandedTagIds, setExpandedTagIds] = useState([]);
  const userRole = localStorage.getItem('role');
  const votreToken = localStorage.getItem('token');
  const [isModerator, setIsModerator] = useState(false);
  const {t} = useTranslation();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/tags/getAll', {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        });
        setTags(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching tags:', error.message);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.roles !== null) {
          const userRoles = user.roles;
          if (userRoles.includes("ROLE_MODERATOR")) {
            setIsModerator(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user roles:', error.message);
      }
    };
 
    fetchUserRoles();
  }, []);

  const handleAddTag = async () => {
    const { value: formValues } = await Swal.fire({
      title: t('Add New Tag'),
      html: `
        <div class="swal2-custom-input-container">
          <input id="name" class="swal2-input swal2-custom-input" placeholder="${t('Enter tag name')}" />
        </div>
        <div class="swal2-custom-textarea-container">
          <textarea id="description" class="swal2-textarea swal2-custom-textarea" placeholder="${t('Enter tag description')}" rows="4"></textarea>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('name').value.trim();
        const description = document.getElementById('description').value.trim();
  
        if (!name) {
          Swal.showValidationMessage(t('Tag name is required.'));
          return false;
        }
  
        return { name, description };
      },
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title',
        confirmButton: 'swal2-custom-confirm-button',
      },
    });
  
    if (formValues) {
      try {
        await axios.post('http://localhost:8080/api/tags/create', formValues, {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        });
  
        // Refresh the tags list
        const response = await axios.get('http://localhost:8080/api/tags/getAll', {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        });
        setTags(response.data);
  
        Swal.fire({
          title: t('Tag added successfully!'),
          icon: 'success',
          customClass: {
            popup: 'swal2-custom-popup',
            confirmButton: 'swal2-custom-confirm-button',
          },
        });
      } catch (error) {
        console.error(t('Error adding tag:'), error.message);
        Swal.fire({
          title: t('Error adding tag'),
          text: error.message,
          icon: 'error',
          customClass: {
            popup: 'swal2-custom-popup',
            confirmButton: 'swal2-custom-confirm-button',
          },
        });
      }
    }
  };
  

  useEffect(() => {
    const options = {
      bottom: '64px',
      right: 'unset',
      left: '32px',
      time: '0.5s',
      mixColor: '#fff',
      backgroundColor: '#fff',
      buttonColorDark: '#100f2c',
      buttonColorLight: '#fff',
      saveInCookies: false,
      label: '🌓',
      autoMatchOsTheme: true
    };
  
    const darkmode = new Darkmode(options);
    darkmode.showWidget();
  }, []);
  
  const handleDeleteTag = async (tagId) => {
    // Afficher une boîte de dialogue de confirmation avant la suppression
    const confirmation = await Swal.fire({
      title: t('Are you sure?'),
      text: t('You will not be able to recover this tag!'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('Yes, delete it!'),
      cancelButtonText: t('Cancel'),
    });

    if (confirmation.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/tags/${tagId}`, {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        });
        // Actualiser la liste des tags après la suppression
        const updatedTags = tags.filter((tag) => tag.id !== tagId);
        setTags(updatedTags);
        Swal.fire(t('Tag deleted successfully!'), '', 'success');
      } catch (error) {
        console.error('Error deleting tag:', error.message);
        Swal.fire(t('Error deleting tag'), '', 'error');
      }
    }
  };

  const handleEditTag = async (tagId) => {
    const tagToUpdate = tags.find((tag) => tag.id === tagId);
    const { value: updatedTag } = await Swal.fire({
      title: 'Edit Tag',
      html:
        `<input id="swal-input-name" class="swal2-input" placeholder="Tag Name" value="${tagToUpdate.name}">` +
        `<textarea id="swal-input-description" class="swal2-textarea" placeholder="Tag Description">${tagToUpdate.description}</textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('swal-input-name').value;
        const description = document.getElementById('swal-input-description').value;
        return { name, description }; // Ensure both name and description are returned
      },
    });

    if (updatedTag) {
      try {
        await axios.put(`http://localhost:8080/api/tags/${tagId}`, updatedTag, {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        });
        Swal.fire({
          title: t('Tag updated successfully!'),
          icon: 'success',
          timer: 5000, // Time in milliseconds (e.g., 5000ms = 5 seconds)
          showConfirmButton: false, // Optionally hide the confirm button
        });
        // Update only the tag's description
        setTags((prevTags) =>
          prevTags.map((tag) =>
            tag.id === tagId ? { ...tag, description: updatedTag.description } : tag,
          ),
        );
      } catch (error) {
        console.error('Error updating tag:', error.message);
        Swal.fire(t('Error updating tag'), '', 'error');
      }
    }
  };

  const toggleDescription = (tagId) => {
    setExpandedTagIds((prevExpandedTagIds) =>
      prevExpandedTagIds.includes(tagId)
        ? prevExpandedTagIds.filter((id) => id !== tagId)
        : [...prevExpandedTagIds, tagId]
    );
  };

  return (
    <>
      <NewNavbar />

      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          {' '}
          {/* This div will take up the remaining space */}
          <div style={{ marginTop: '13vh', zIndex: 1, backgroundColor: 'white' }}>
            <div className="">
              <div className="stack-index">
                <div className="stack-index-content">
                  <div className="main">
                    <h1 style={{ marginTop: '-20px' }}>Tags</h1>
                    <div className="mt-5">
                    {isModerator && (
                        <button
                          className="btn"
                          style={{ float: 'right', backgroundColor: '#cf022b', color: '#fff' }}
                          onClick={handleAddTag}
                        >
                          {t('Ajouter Tag')}
                        </button>
                      )}
                      {t('tagdescription1')}
                      <br />
                      {t('tagdescription2')}
                    </div>
                    <div className="row row-cols-1 row-cols-md-4 g-4 mt-3">
                      {tags.map((tag) => (
                        <div key={tag.id} className="col">
                          <div className="card h-100">
                            <div className="card-body">
                              <NavLink
                                className="card-title p-1"
                                to={{ pathname: `/client/questionOntags/${tag.name}` }}
                                style={{
                                  color: 'hsl(205,47%,42%)',
                                  backgroundColor: 'hsl(205,46%,92%)',
                                  borderRadius: '5px',
                                  display: 'inline',
                                }}
                              >
                                {tag.name}
                              </NavLink>
                              <p className="card-text m-2">
                                {expandedTagIds.includes(tag.id)
                                  ? tag.description
                                  : tag.description ? tag.description.slice(0, 100) : ''}...
                                <button
                                  onClick={() => toggleDescription(tag.id)}
                                  className="btn btn-link"
                                  style={{ padding: 0 }}
                                >
                                  {expandedTagIds.includes(tag.id) ? 'Less' : t('Learn More')}
                                </button>
                              </p>
                              {isModerator && (
                                <div style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
                                  <FaTrash
                                    style={{ marginRight: '5px', cursor: 'pointer' }}
                                    onClick={() => handleDeleteTag(tag.id)}
                                  />
                                  <FaEdit
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleEditTag(tag.id)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
