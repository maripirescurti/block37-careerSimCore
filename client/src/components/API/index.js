export const fetchServices = async () => {
  const response = await fetch('/api/services');
  if (response.ok) {
    const json = await response.json();
    setServices(json);
  } else {
    const errorJson = await response.json();
    console.error('Error fetching services', errorJson);
  }
  return response.json();
};