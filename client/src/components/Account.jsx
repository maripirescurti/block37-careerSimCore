import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  fetchUserById, 
  fetchUserPets, 
  addPet, 
  updatePet, 
  fetchFavorites, 
  removeFavorite, 
  fetchServiceById, 
  fetchSpecies 
} from "./API";
import '../styles/Account.css';

export default function Account({ token }) {
  const [userInfo, setUserInfo] = useState(null);
  const [pets, setPets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [error, setError] = useState(null);
  const [petFormVisible, setPetFormVisible] = useState(false);
  const [updateFormVisible, setUpdateFormVisible] = useState(null);
  const [newPet, setNewPet] = useState({ pet_name: "", species_id: "", breed: "", age: "", weight: "" });
  const [updatedPetData, setUpdatedPetData] = useState({});
  const navigate = useNavigate();
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [user, userPets, userFavorites, species] = await Promise.all([
          fetchUserById(userId, token),
          fetchUserPets(userId, token),
          fetchFavorites(userId, token),
          fetchSpecies()
        ]);

        console.log('Fetched User:', user); // Debug user info
        setUserInfo(user);

        const petsWithSpeciesName = userPets.map(pet => {
          const speciesObj = species.find(s => s.id === pet.species_id);
          return { ...pet, species_name: speciesObj ? speciesObj.type_name : 'Unknown' };
        });

        setPets(petsWithSpeciesName);
        setSpeciesList(species);

        const favoriteDetails = await Promise.all(
          userFavorites.map(async (favorite) => {
            try {
              const service = await fetchServiceById(favorite.service_id, token);
              return { ...favorite, service };
            } catch (err) {
              console.error('Failed to fetch service:', err);
              return { ...favorite, service: null };
            }
          })
        );

        setFavorites(favoriteDetails);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
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

  const handleUpdatePet = async (petId) => {
    try {
      const updatedPet = await updatePet(userId, petId, updatedPetData, token);
      setPets(pets.map(pet => (pet.id === petId ? updatedPet : pet)));
      setUpdateFormVisible(null); // Close form after update
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

      {/* User Info Section */}
      {userInfo ? (
        <div className="user-info">
          <h2>User Information</h2>
          <p><strong>Name:</strong> {userInfo.first_name} {userInfo.last_name}</p>
          <p><strong>Username:</strong> {userInfo.username}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}

      {/* Pets Section */}
      <h2>Your Pets</h2>
      {pets.length === 0 ? (
        <p>You have no registered pets. Please add a pet!</p>
      ) : (
        pets.map((pet) => (
          <div key={pet.id} className="pet-card">
            <p><strong>Name:</strong> {pet.pet_name}</p>
            <p><strong>Species:</strong> {pet.species_name || 'Not Available'}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Age:</strong> {pet.age}</p>
            <p><strong>Weight:</strong> {pet.weight}</p>
            <button onClick={() => setUpdateFormVisible(pet.id)}>
              Update Pet
            </button>

            {updateFormVisible === pet.id && (
              <form className="update-form" onSubmit={(e) => {
                e.preventDefault();
                handleUpdatePet(pet.id);
              }}>
                <input
                  type="number"
                  placeholder="Age"
                  value={updatedPetData.age || ''}
                  onChange={(e) => setUpdatedPetData({ ...updatedPetData, age: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Weight"
                  value={updatedPetData.weight || ''}
                  onChange={(e) => setUpdatedPetData({ ...updatedPetData, weight: e.target.value })}
                />
                <button type="submit">Submit Update</button>
              </form>
            )}
          </div>
        ))
      )}

      {/* Add Pet Form */}
      <button className="add-pet-button" onClick={() => setPetFormVisible(!petFormVisible)}>Add Pet</button>
      {petFormVisible && (
        <form className="pet-form" onSubmit={handleAddPet}>
          <input
            type="text"
            placeholder="Pet Name"
            value={newPet.pet_name}
            onChange={(e) => setNewPet({ ...newPet, pet_name: e.target.value })}
          />
          <select
            value={newPet.species_id}
            onChange={(e) => setNewPet({ ...newPet, species_id: e.target.value })}
          >
            <option value="">Select Species</option>
            {speciesList.map((species) => (
              <option key={species.id} value={species.id}>
                {species.type_name}
              </option>
            ))}
          </select>
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

      {/* Favorites Section */}
      <h2>Favorite Services</h2>
      {favorites.length === 0 ? (
        <p>No favorite services.</p>
      ) : (
        favorites.map((fav) => (
          <div 
            key={fav.id} 
            className="favorite-card" 
            onClick={() => navigate(`/services/${fav.service_id}`)}
          >
            {fav.service ? (
              <>
                <img 
                  src={fav.service.image_url} 
                  alt={fav.service.name} 
                  onError={(e) => (e.target.src = '/fallback-image.jpg')}
                />
                <div className="favorite-card-info">
                  <p>{fav.service.name}</p>
                </div>
              </>
            ) : (
              <p>Loading service details...</p>
            )}
            <button onClick={(e) => {
              e.stopPropagation(); 
              handleRemoveFavorite(fav.id);
            }}>
              Remove from Favorites
            </button>
          </div>
        ))
      )}
    </div>
  );
}