import React, { useEffect, useState } from "react";
import { fetchServiceById, addFavorite, removeFavorite, fetchFavorites } from "./API";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/SingleService.css";

export default function SingleService({ token }) {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  useEffect(() => {
    const fetchSingleService = async () => {
      try {
        const data = await fetchServiceById(id);
        setService(data);
      } catch (error) {
        console.error("Error fetching service:", error);
      }
    };

    const fetchUserFavorites = async () => {
      if (userId && token) {
        try {
          const userFavorites = await fetchFavorites(userId, token);
          setFavorites(userFavorites);
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
      }
    };

    fetchSingleService();
    fetchUserFavorites();
  }, [id, userId, token]);

  const isFavorite = (serviceId) =>
    favorites.some((favorite) => favorite.service_id === serviceId);

  const handleFavoriteToggle = async () => {
    if (!token) {
      alert("Log in or register to add favorites!");
      return;
    }

    const favorite = favorites.find((fav) => fav.service_id === id);

    try {
      if (favorite) {
        await removeFavorite(userId, favorite.id, token);
        setFavorites(favorites.filter((fav) => fav.service_id !== id));
      } else {
        const newFavorite = await addFavorite(userId, id, token);
        setFavorites([...favorites, newFavorite]);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Cannot update favorites.");
    }
  };

  if (!service) return <p>Loading...</p>;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? "filled" : ""}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const averageRating = () => {
    if (service.reviews.length === 0) return 0;
    const totalRating = service.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (totalRating / service.reviews.length).toFixed(1);
  };

  return (
    <div className="single-service-container">
      <h2>{service.name}</h2>

      {/* Heart Icon for Favorite */}
      <div className="favorite-heart" onClick={handleFavoriteToggle}>
        <span className={`heart ${isFavorite(id) ? "filled-heart" : ""}`}>
          ♥
        </span>
      </div>

      <img
        src={service.image_url}
        alt={service.name}
        className="single-service-image"
      />
      <p><strong>Service:</strong> {service.category_name}</p>
      <p><strong>Animal Specialty:</strong> {service.species_name}</p>
      <p>{service.description}</p>

      <h3>Average Rating</h3>
      <div className="stars">{renderStars(averageRating())}</div>

      <h3>Reviews</h3>
      {service.reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        service.reviews.map((review) => (
          <div key={review.id} className="review">
            <p><strong>Rating:</strong> {renderStars(review.rating)}</p>
            <p>{review.review_text}</p>
          </div>
        ))
      )}

      <button className="back-button" onClick={() => navigate("/")}>
        Back to Home Page
      </button>
    </div>
  );
}