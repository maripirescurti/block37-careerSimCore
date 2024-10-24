import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Services.css";
import {
  fetchServices,
  fetchReviewsByService,
  addFavorite,
  removeFavorite,
  fetchFavorites,
} from "./API";

export default function Services({ token }) {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  useEffect(() => {
    const getServices = async () => {
      try {
        const data = await fetchServices();
        const servicesWithRatings = await Promise.all(
          data.map(async (service) => {
            const reviews = await fetchReviewsByService(service.id);
            const averageRating =
              reviews.length > 0
                ? (
                    reviews.reduce((acc, curr) => acc + curr.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : 0;
            return { ...service, averageRating };
          })
        );
        setServices(servicesWithRatings);
      } catch (error) {
        console.error('Error fetching services', error);
        setServices([]);
      }
    };

    const getFavorites = async () => {
      if (userId && token) {
        try {
          const favorites = await fetchFavorites(userId, token);
          setFavorites(favorites);
        } catch (error) {
          console.error('Error fetching favorites', error);
        }
      }
    };

    getServices();
    getFavorites();
  }, [userId, token]);

  const filteredServices = services.filter((service) =>
    service.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFavorite = (serviceId) =>
    favorites.some((favorite) => favorite.service_id === serviceId);

  const handleFavorite = async (serviceId) => {
    if (!token) {
      alert('Log in or register to add favorites!');
      return;
    }

    try {
      const favorite = favorites.find((fav) => fav.service_id === serviceId);
      if (favorite) {
        await removeFavorite(userId, favorite.id, token);
        setFavorites(favorites.filter((fav) => fav.service_id !== serviceId));
      } else {
        const newFavorite = await addFavorite(userId, serviceId, token);
        setFavorites([...favorites, newFavorite]);
      }
    } catch (error) {
      console.error('Error adding/removing favorite:', error);
      alert('Cannot update favorites.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          &#9733;
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="services-container">
      <h2>Your Pet is my Boss!!!</h2>
      <p>Find the best pet service here!</p>
      <input
        type="text"
        placeholder="Search services by category"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <div className="services-grid">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="service-card"
              onClick={() => navigate(`/services/${service.id}`)}
            >
              <img
                src={service.image_url}
                alt={service.name}
                className="service-image"
              />
              <h4>{service.name}</h4>
              <p>Category: {service.category_name}</p>
              <div className="rating">{renderStars(Math.round(service.averageRating))}</div>
              <div className="button-container">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(service.id);
                  }}
                  className={`heart-icon ${isFavorite(service.id) ? 'filled' : ''}`}
                >
                  ♥
                </div>
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