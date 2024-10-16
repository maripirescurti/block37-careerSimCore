export const fetchServices = async () => {
  const response = await fetch('http://localhost:3000/api/services');

  if (response.ok) {
    const json = await response.json();
    console.log(response);
    return json;
  } else {
    const errorJson = await response.json();
    console.error('Error fetching services', errorJson);
    throw new Error(`Error fetching services: ${errorJson.message}`);
  }
  return response.json();
};

export const fetchServiceById = async (id) => {
  const response = await fetch(`http://localhost:3000/api/services/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch book');
  }
  return response.json();
};

export const addFavorite = async (serviceId, token) => {
  const response = await fetch('http://localhost:3000/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ serviceId }),
  });

  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(`Error adding favorite: ${errorJson.message}`);
  }

  return response.json();
}