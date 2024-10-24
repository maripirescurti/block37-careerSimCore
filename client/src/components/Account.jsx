import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  fetchUserPets, 
  addPet, 
  updatePet, 
  fetchFavorites, 
  removeFavorite 
} from "./API";

export default function Account({ token }) {
  const [userInfo, setUserInfo] = useState(null);
  const [pets, setPets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [petFormVisible, setPetFormVisible] = useState(false);
  const [updateFormVisible, setUpdateFormVisible] = useState(null); // Track which pet is being updated
  const [newPet, setNewPet] = useState({ pet_name: "", species_id: "", breed: "", age: "", weight: "" });
  const navigate = useNavigate();
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const userPets = await fetchUserPets(userId, token);
        setPets(userPets);

        const userFavorites = await fetchFavorites(userId, token);
        setFavorites(userFavorites);
      } catch (error) {
        setError(error.message);
      }
    };

    loadData();
  }, [userId, token]);

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      const addedPet = await addPet(userId, newPet, token);
      setPets([...pets, addedPet]);
      setNewPet({ pet_name: "", species_id: "", breed: "", age: "", weight: "" });
      setPetFormVisible(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdatePet = async (petId, updatedData) => {
    try {
      const updatedPet = await updatePet(userId, petId, updatedData, token);
      setPets(pets.map(pet => (pet.id === petId ? updatedPet : pet)));
      setUpdateFormVisible(null); // Close the form after update
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await removeFavorite(userId, favoriteId, token);
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      setError(error.message);
    }
  };

  if (!token) {
    return <p>Please Log In to see account information!</p>;
  }

  return (
    <div className="account-container">
      <h1>Your Pet is my Boss!</h1>
      <h2>Account Information</h2>

      {userInfo && (
        <div>
          <p><strong>First Name:</strong> {userInfo.first_name}</p>
          <p><strong>Last Name:</strong> {userInfo.last_name}</p>
          <p><strong>Username:</strong> {userInfo.username}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
        </div>
      )}

      <h2>Your Pets</h2>
      {pets.length === 0 ? (
        <p>You have no registered pets. Please add a pet!</p>
      ) : (
        pets.map((pet) => (
          <div key={pet.id} className="pet-card">
            <p><strong>Name:</strong> {pet.pet_name}</p>
            <p><strong>Species:</strong> {pet.species_name}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Age:</strong> {pet.age}</p>
            <p><strong>Weight:</strong> {pet.weight}</p>
            <button onClick={() => setUpdateFormVisible(pet.id)}>Update Pet Info</button>

            {updateFormVisible === pet.id && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const { age, weight } = e.target.elements;
                handleUpdatePet(pet.id, { age: age.value, weight: weight.value });
              }}>
                <input type="number" name="age" placeholder="Age" />
                <input type="number" name="weight" placeholder="Weight" />
                <button type="submit">Submit</button>
              </form>
            )}
          </div>
        ))
      )}

      <button onClick={() => setPetFormVisible(!petFormVisible)}>Add Pet</button>

      {petFormVisible && (
        <form onSubmit={handleAddPet}>
          <input
            type="text"
            placeholder="Pet Name"
            value={newPet.pet_name}
            onChange={(e) => setNewPet({ ...newPet, pet_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Species ID"
            value={newPet.species_id}
            onChange={(e) => setNewPet({ ...newPet, species_id: e.target.value })}
          />
          <input
            type="text"
            placeholder="Breed"
            value={newPet.breed}
            onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
          />
          <input
            type="number"
            placeholder="Age"
            value={newPet.age}
            onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
          />
          <input
            type="number"
            placeholder="Weight"
            value={newPet.weight}
            onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
          />
          <button type="submit">Submit</button>
        </form>
      )}

      <h2>Favorite Services</h2>
      {favorites.length === 0 ? (
        <p>No favorite services.</p>
      ) : (
        favorites.map((fav) => (
          <div key={fav.id} className="favorite-card">
            <img src={fav.image_url} alt={fav.name} />
            <p>{fav.name}</p>
            <button onClick={() => navigate(`/services/${fav.service_id}`)}>View Details</button>
            <button onClick={() => handleRemoveFavorite(fav.id)}>Remove from Favorites</button>
          </div>
        ))
      )}
    </div>
  );
}