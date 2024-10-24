import React, { useEffect, useState } from "react";
import { 
  fetchServiceById, 
  addFavorite, 
  removeFavorite, 
  fetchFavorites, 
  addReview 
} from "./API";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/SingleService.css";

export default function SingleService({ token }) {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [userReviewed, setUserReviewed] = useState(false); // Track if user already reviewed
  const [isFormVisible, setIsFormVisible] = useState(false);
  const navigate = useNavigate();
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  useEffect(() => {
    const fetchSingleService = async () => {
      try {
        const data = await fetchServiceById(id);
        setService(data);

        // Check if user already reviewed this service
        const userReview = data.reviews.find(review => review.user_id === userId);
        if (userReview) setUserReviewed(true);
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

    const favorite = favorites.find(fav => fav.service_id === id);
    try {
      if (favorite) {
        await removeFavorite(userId, favorite.id, token);
        setFavorites(favorites.filter(fav => fav.service_id !== id));
      } else {
        const newFavorite = await addFavorite(userId, id, token);
        setFavorites([...favorites, newFavorite]);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Cannot update favorites.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Log in or register to submit a review!");
      return;
    }
    try {
      const newReview = await addReview(id, userId, rating, reviewText, token);
      setService({ ...service, reviews: [...service.reviews, newReview] });
      alert("Review submitted successfully!");
      setIsFormVisible(false);
      setUserReviewed(true); // Mark that the user has reviewed
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    }
  };

  const renderStars = (currentRating) =>
    [...Array(5)].map((_, index) => (
      <span
        key={index}
        onClick={() => setRating(index + 1)}
        style={{ cursor: "pointer", color: index < currentRating ? "#ffc107" : "#e4e5e9" }}
      >
        ★
      </span>
    ));

  if (!service) return <p>Loading...</p>;

  return (
    <div className="single-service-container">
      <h2>{service.name}</h2>

      {/* Favorite Heart Icon */}
      <div className="favorite-heart" onClick={handleFavoriteToggle}>
        <span className={`heart ${isFavorite(id) ? "filled-heart" : ""}`}>♥</span>
      </div>

      <img
        src={service.image_url}
        alt={service.name}
        className="single-service-image"
      />
      <p><strong>Service:</strong> {service.category_name}</p>
      <p><strong>Animal Specialty:</strong> {service.species_name}</p>
      <p>{service.description}</p>

      {/* Add Review Button */}
      {token && !userReviewed ? (
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="back-button"
        >
          Add Review
        </button>
      ) : (
        <p>You’ve already reviewed this service.</p>
      )}

      {/* Review Form */}
      {isFormVisible && (
        <form onSubmit={handleReviewSubmit} className="review-form">
          <div>{renderStars(rating)}</div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review"
            required
          />
          <button type="submit" className="back-button">
            Submit
          </button>
        </form>
      )}

      <h3>Average Rating</h3>
      <div className="stars">
        {renderStars(
          service.reviews.length
            ? service.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
              service.reviews.length
            : 0
        )}
      </div>

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