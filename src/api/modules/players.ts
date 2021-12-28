import api from '../handler';
import { Player, PlayerAchievement, PlayerGains, PlayerRecord } from '../types';
import { convertDates } from '../utils';

/*
 * Fetch the player details from the API.
 */
async function fetchPlayer(username: string): Promise<Player> {
  const URL = `/players/username/${username}`;
  const { data } = await api.get(URL);

  // Convert date strings into date instances
  convertDates(data, ['registeredAt', 'updatedAt', 'lastImportedAt']);
  convertDates(data.latestSnapshot, ['createdAt', 'importedAt']);

  return data;
}

/**
 * Send an API request attempting to update a given username.
 */
async function updatePlayer(username: string): Promise<Player> {
  const URL = `/players/track`;
  const { data } = await api.post(URL, { username });

  // Convert date strings into date instances
  convertDates(data, ['registeredAt', 'updatedAt', 'lastImportedAt']);
  convertDates(data.latestSnapshot, ['createdAt', 'importedAt']);

  return data;
}

/**
 * Send an API request attempting to delete a player (and all its data)
 */
async function deletePlayer(username: string): Promise<{ message: string }> {
  const URL = `/players/username/${username}`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const { data } = await api.delete(URL, { data: { adminPassword } });

  return data;
}

/**
 * Send an API request attempting to update a player's country
 */
async function updateCountry(username: string, country: string): Promise<{ message: string }> {
  const URL = `/players/username/${username}/country`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const { data } = await api.put(URL, { country, adminPassword });

  return data;
}

/**
 * Fetch the player's gains from the API.
 */
async function fetchPlayerGains(username: string, period: string): Promise<PlayerGains> {
  const URL = `/players/username/${username}/gained`;
  const { data } = await api.get(URL, { params: { period } });

  // Convert date strings into date instances
  convertDates(data, ['startsAt', 'endsAt']);

  return data;
}

/**
 * Fetch the player's records from the API.
 */
async function fetchPlayerRecords(username: string, metric: string): Promise<PlayerRecord[]> {
  const URL = `/players/username/${username}/records`;
  const { data } = await api.get(URL, { params: { metric } });

  // Convert date strings into date instances
  convertDates(data, ['updatedAt']);

  return data;
}

/**
 * Fetch the player's achievements from the API.
 */
async function fetchPlayerAchievements(username: string, limit = 5): Promise<PlayerAchievement[]> {
  const URL = `/players/username/${username}/achievements`;
  const { data } = await api.get(URL);

  if (!data) {
    return [];
  }

  const achievements: PlayerAchievement[] = data;

  // Convert date strings into date instances
  convertDates(achievements, ['createdAt']);

  return achievements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

export {
  fetchPlayer,
  updatePlayer,
  updateCountry,
  fetchPlayerGains,
  fetchPlayerRecords,
  fetchPlayerAchievements,
  deletePlayer
};
