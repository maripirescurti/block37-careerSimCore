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
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null; // Extract user ID from token

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
                : "No ratings yet";
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
          setFavorites(favorites); // Store the full favorite objects
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
        // If favorite exists, remove it
        await removeFavorite(userId, favorite.id, token);
        setFavorites(favorites.filter((fav) => fav.service_id !== serviceId));
      } else {
        // If not a favorite, add it
        const newFavorite = await addFavorite(userId, serviceId, token);
        setFavorites([...favorites, newFavorite]);
      }
    } catch (error) {
      console.error('Error adding/removing favorite:', error);
      alert('Cannot update favorites.');
    }
  };

  return (
    <div className="services-container">
      <h2>Your Pet is my Boss!!!</h2>
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
            <div key={service.id} className="service-card">
              <img
                src={service.image_url}
                alt={service.name}
                className="service-image"
              />
              <h4>{service.name}</h4>
              <p>Category: {service.category_name}</p>
              <p>Rating: {service.averageRating}</p>
              <div className="button-container">
                <button
                  onClick={() => navigate(`/services/${service.id}`)}
                  className="service-button"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleFavorite(service.id)}
                  className="favorite-button"
                >
                  {isFavorite(service.id)
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </button>
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