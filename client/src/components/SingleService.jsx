import React, { useEffect, useState } from "react";
import { fetchServiceById } from "./API"; // Ensure this function fetches data from your updated API
import { useParams, useNavigate } from "react-router-dom";

export default function SingleService() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSingleService = async () => {
      try {
        const data = await fetchServiceById(id);
        setService(data);
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };
    fetchSingleService();
  }, [id]);

  if (!service) return <p>Loading...</p>;

  // Calculate average rating
  const averageRating = () => {
    if (service.reviews.length === 0) return 0;

    const totalRating = service.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (totalRating / service.reviews.length).toFixed(1); // One decimal place
  };

  return (
    <div className="single-service-container">
      <h2>{service.name}</h2>
      <img src={service.image_url} alt={service.name} className="single-service-image" />
      <p><strong>Service:</strong> {service.category_name}</p>
      <p><strong>Animal Specialty:</strong> {service.species_name}</p>
      <p>{service.description}</p>

      <h3>Average Rating: {averageRating() || 'No ratings yet'}</h3>

      <h3>Reviews</h3>
      {service.reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        service.reviews.map(review => (
          <div key={review.id} className="review">
            <p><strong>Rating:</strong> {review.rating}</p>
            <p>{review.review_text}</p>
            <h4>Comments:</h4>
            {review.comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              review.comments.map(comment => (
                <div key={comment.id} className="comment">
                  <p>{comment.text}</p>
                </div>
              ))
            )}
          </div>
        ))
      )}

      <button onClick={() => navigate("/")}>Back to Home Page</button>
    </div>
  );
}
