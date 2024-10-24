
export const fetchServices = async () => {
  const response = await fetch('http://localhost:3000/api/services');

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
  const response = await fetch('http://localhost:3000/api/categories');

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
  const response = await fetch(`http://localhost:3000/api/services/${id}`);
  if (!response.ok) {
    const errorJson = await response.json();
    console.error('Error fetching service:', errorJson);
    throw new Error(`Error fetching service: ${errorJson.message || 'Service not found'}`);
  }
  return response.json();
};

export const fetchReviewsByService = async (serviceId) => {
  const response = await fetch(`http://localhost:3000/api/services/${serviceId}/reviews`);
  if (response.ok) {
    const reviews = await response.json();
    return reviews;
  } else {
    const errorJson = await response.json();
    console.error('Error fetching reviews:', errorJson);
    throw new Error('Failed to fetch reviews');
  }
};

export const addFavorite = async (serviceId, token) => {
  const response = await fetch('http://localhost:3000/api/users/me/favorites', {
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

export const removeFavorite = async (serviceId, token) => {
  const response = await fetch(`http://localhost:3000/api/users/me/favorites/${serviceId}`, {
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
