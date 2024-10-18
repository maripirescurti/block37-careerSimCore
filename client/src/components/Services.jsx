import React, { useState, useEffect } from "react";
import { fetchServices, addFavorite } from "./API";
import { useNavigate } from "react-router-dom";

export default function Services({ token }) {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getServices = async () => {
      try {
        const data = await fetchServices();
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services', error);
        setServices([]);
      }
    };
    getServices();
  }, []);

  const filteredServices = services.filter(service =>
    service.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleFavorite = async (serviceId) => {
    if (!token) {
      alert('Log in or register to add favorites!');
      return;
    }

    try {
      await addFavorite(serviceId, token);
      alert('Service added to favorites!')
    } catch (error) {
      console.error('Error adding favorite:', error);
      alert('Please log in or register to add favorites.');
    }
  };

  return (
    <div className='services-container'>
      <h2>Services</h2>
      <input 
        type="text"
        placeholder="='Search services by category"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="search-bar"
      />
      <div className="services-grid">
        {Array.isArray(filteredServices) && filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className='service-card'
            >
              <img src={service.image_url} alt={service.name} className="service-image" />
              <h4>{service.name}</h4>
              <p>{service.category_name}</p>
              <div className="button-container">
                <button onClick={() => navigate(`/services/${service.id}`)} className="service-button">View Details</button>
                <button onClick={() => handleFavorite(service.id)} className="favorite-button">Add to Favorites</button>
              </div>
            </div>
          ))
        ) : (
          <p>No services found.</p>
        )}
      </div>
    </div>
  );
}


