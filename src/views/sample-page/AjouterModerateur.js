import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import 'src/views/sample-page/AjouterModerateur.css';
import { useNavigate } from 'react-router';
import { Margin } from '@mui/icons-material';

const AjouterModerateur = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        username: '',
        role: ["mod"]
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            if (!formData[key]) {
                newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8083/api/auth/signup', formData);
            console.log(response.data);
            Swal.fire({
                icon: 'success',
                title: 'Ajout réussie !',
                showConfirmButton: false,
                timer: 15000
            });

            setLoading(false);
            navigate('/dashboard');
        } catch (error) {
            setLoading(false);
            if (error.response && error.response.data.error) {
                setErrors({ ...errors, username: 'Le nom utilisateur ou adresse électronique existe déjà' });
            } else {
                console.error('Erreur lors de lajout', error.response ? error.response.data : error.message);
            }
        }
    };

    return (
        <PageContainer title="Ajouter Modérateur" description="Ajouter Modérateur">
            <DashboardCard title="Ajouter Modérateur">
                <div className="testbox">
                    <form id="formMP" onSubmit={handleSubmit}>
                        <div className="form-group item">
                            <label>Nom complet *</label>
                            <div className="name-fields name-item">
                                <input
                                    type="text"
                                    name="prenom"
                                    placeholder="Prénom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    className={errors.prenom ? 'input-error' : ''}
                                    required
                                />
                                <input
                                    type="text"
                                    name="nom"
                                    placeholder="Nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className={errors.nom ? 'input-error' : ''}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group item contact-item">
                            <label>Adresse e-mail *</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'input-error' : ''}
                                required
                            />
                        </div>

                        <div className="form-group item contact-item">
                            <label>Nom d'utilisateur *</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Nom d'utilisateur"
                                value={formData.username}
                                onChange={handleChange}
                                className={errors.username ? 'input-error' : ''}
                                required
                            />
                        </div>

                        <div className="form-group btn-block">
                            <button className="btn btn-danger custom-btn" type="submit" disabled={loading}>
                                {loading ? 'Ajout en cours...' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardCard>
        </PageContainer>
    );
};

export default AjouterModerateur;
