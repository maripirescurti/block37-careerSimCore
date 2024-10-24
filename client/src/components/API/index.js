const API_URL = 'http://localhost:3000/api';

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Error logging in:', result);
    throw new Error(result.message || 'Login failed.');
  }

  return result;
};

export const registerUser = async (first_name, last_name, username, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      first_name, 
      last_name, 
      username, 
      email, 
      password 
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Error registering user:', result);
    throw new Error(result.message || 'Sign up failed.');
  }

  return result;
};

export const fetchServices = async () => {
  const response = await fetch(`${API_URL}/services`);

  if (response.ok) {
    const json = await response.json();
    // console.log(response);
    return json;
  } else {
    const errorJson = await response.json();
    console.error('Error fetching services', errorJson);
    throw new Error(`Error fetching services: ${errorJson.message}`);
  }
};

export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);

  if (response.ok) {
    const json = await response.json();
    console.log(response);
    return json;
  } else {
    const errorJson = await response.json();
    console.error('Error fetching categories', errorJson);
    throw new Error(`Error fetching categories: ${errorJson.message}`);
  }
};

export const fetchServiceById = async (id) => {
  const response = await fetch(`${API_URL}/services/${id}`);
  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error fetching service:', errorJson);
    throw new Error(`Error fetching service: ${errorJson.message || 'Service not found'}`);
  }
  return response.json();
};

export const fetchFavorites = async (userId, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/favorites`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error fetching favorites:', errorJson);
    throw new Error(errorJson.message);
  }

  return response.json();
};

export const fetchUserPets = async (userId, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/pets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error fetching pets:', errorJson);
    throw new Error(errorJson.message);
  }
  return response.json();
};


export const fetchReviewsByService = async (serviceId) => {
  const response = await fetch(`${API_URL}/services/${serviceId}/reviews`);
  if (response.ok) {
    const reviews = await response.json();
    return reviews;
  } else {
    const errorJson = await response.json();
    console.error('Error fetching reviews:', errorJson);
    throw new Error('Failed to fetch reviews');
  }
};


export const addPet = async (userId, petData, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/pets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(petData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to add pet');
  }
  return result;
};

export const addFavorite = async (userId, serviceId, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ service_id: serviceId }),
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error adding favorite:', errorJson)
    throw new Error(errorJson.message);
  }

  return response.json();
};

export const addReview = async (serviceId, userId, rating, reviewText, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/services/${serviceId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, review_text: reviewText }),
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error adding review:', errorJson);
    throw new Error(errorJson.message);
  }

  return response.json();
};

export const addComment = async (reviewId, userId, serviceId, commentText, token) => {
  const response = await fetch(
    `http://localhost:3000/api/users/${userId}/services/${serviceId}/reviews/${reviewId}/comments`, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ comment_text: commentText }),
    }
  );

  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error adding comment:', errorJson);
    throw new Error(errorJson.message || 'Failed to add comment.');
  }

  return response.json();
};


export const updatePet = async (userId, petId, updatedData, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/pets/${petId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to update pet');
  }
  return result;
};


export const fetchCommentsByReview = async (reviewId) => {
  const response = await fetch(`http://localhost:3000/api/services/reviews/${reviewId}/comments`);
  
  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error fetching comments:', errorJson);
    throw new Error(errorJson.message || 'Failed to fetch comments.');
  }

  return response.json();
};

export const updateReview = async (userId, serviceId, rating, reviewText, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/services/${serviceId}/reviews`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, review_text: reviewText }),
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error updating review:', errorJson);
    throw new Error(errorJson.message);
  }

  return response.json();
};

export const removeFavorite = async (userId, favoriteId, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/favorites/${favoriteId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error removing favorite:', errorJson);
    throw new Error(errorJson.message);
  }
  
  return response.json();
};
