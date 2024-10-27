import React, { useEffect, useState } from "react";
import { 
  fetchServiceById, 
  addFavorite, 
  removeFavorite, 
  fetchFavorites, 
  addReview, 
  updateReview, 
  deleteReview 
} from "./API"; // Import deleteReview function
import { useParams, useNavigate } from "react-router-dom";
import "../styles/SingleService.css";

export default function SingleService({ token }) {
  const { id: serviceId } = useParams();
  const [service, setService] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const navigate = useNavigate();
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  // Fetch service details and user's review
  useEffect(() => {
    const fetchSingleService = async () => {
      try {
        const data = await fetchServiceById(serviceId);
        setService(data);

        const existingReview = data.reviews.find(
          (review) => String(review.user_id) === String(userId)
        );

        if (existingReview) {
          setUserReview(existingReview);
          setReviewText(existingReview.review_text);
          setRating(existingReview.rating);
        } else {
          setUserReview(null);
        }
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
  }, [serviceId, userId, token]);

  const handleFavoriteToggle = async () => {
    if (!token) {
      alert("Log in or register to add favorites!");
      return;
    }

    const favorite = favorites.find((fav) => fav.service_id === serviceId);
    try {
      if (favorite) {
        await removeFavorite(userId, favorite.id, token);
        setFavorites(favorites.filter((fav) => fav.service_id !== serviceId));
      } else {
        const newFavorite = await addFavorite(userId, serviceId, token);
        setFavorites([...favorites, newFavorite]);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Cannot update favorites.");
    }
  };

  const handleAddReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Log in or register to submit a review!");
      return;
    }
    try {
      const newReview = await addReview(serviceId, userId, rating, reviewText, token);
      setService({ ...service, reviews: [...service.reviews, newReview] });
      setUserReview(newReview);
      setIsAddFormVisible(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    }
  };

  const handleEditReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Log in or register to update your review!");
      return;
    }
    try {
      const updatedReview = await updateReview(userId, serviceId, rating, reviewText, token);
      setService({
        ...service,
        reviews: service.reviews.map((review) =>
          review.user_id === userId ? updatedReview : review
        ),
      });
      setUserReview(updatedReview);
      setIsEditFormVisible(false);
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Failed to update review.");
    }
  };

  const handleDeleteReview = async () => {
    if (!token) {
      alert("Log in or register to delete your review!");
      return;
    }
    try {
      await deleteReview(userId, serviceId, userReview.id, token);
      setService({
        ...service,
        reviews: service.reviews.filter((review) => review.id !== userReview.id),
      });
      setUserReview(null);
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review.");
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

      <div className="favorite-heart" onClick={handleFavoriteToggle}>
        <span className={`heart ${favorites.some(fav => fav.service_id === serviceId) ? "filled-heart" : ""}`}>♥</span>
      </div>

      <img src={service.image_url} alt={service.name} className="single-service-image" />
      <p><strong>Service:</strong> {service.category_name}</p>
      <p><strong>Animal Specialty:</strong> {service.species_name}</p>
      <p>{service.description}</p>

      {userReview ? (
        <>
          <button onClick={() => setIsEditFormVisible(!isEditFormVisible)} className="back-button">
            Edit Review
          </button>
          <button onClick={handleDeleteReview} className="back-button">
            Delete Review
          </button>
        </>
      ) : (
        <button onClick={() => setIsAddFormVisible(!isAddFormVisible)} className="back-button">
          Add Review
        </button>
      )}

      {isAddFormVisible && (
        <form onSubmit={handleAddReviewSubmit} className="review-form">
          <div>{renderStars(rating)}</div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review"
            required
          />
          <button type="submit" className="back-button">Submit</button>
        </form>
      )}

      {isEditFormVisible && (
        <form onSubmit={handleEditReviewSubmit} className="review-form">
          <div>{renderStars(rating)}</div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Update your review"
            required
          />
          <button type="submit" className="back-button">Update</button>
        </form>
      )}

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