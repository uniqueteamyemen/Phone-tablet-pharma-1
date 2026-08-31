import { Drug, Prescription, PrescriptionItem } from '../types';
import { INITIAL_DRUG_DATABASE } from '../data/drugDatabase';

const STORAGE_KEYS = {
  DRUGS: 'yemen_drug_guide_drugs_v1',
  PRESCRIPTION_ITEMS: 'yemen_drug_guide_rx_items_v1',
  PRESCRIPTIONS: 'yemen_drug_guide_rx_v1',
  FAVORITES: 'yemen_drug_guide_favs_v1',
  SETTINGS: 'yemen_drug_guide_settings_v1',
};

export const getStoredDrugs = (): Drug[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRUGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(INITIAL_DRUG_DATABASE));
      return INITIAL_DRUG_DATABASE;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DRUG_DATABASE;
  } catch (error) {
    console.error('Failed to load drugs from storage', error);
    return INITIAL_DRUG_DATABASE;
  }
};

export const loadDrugs = getStoredDrugs;

export const saveStoredDrugs = (drugs: Drug[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));
  } catch (error) {
    console.error('Failed to save drugs to storage', error);
  }
};

export const saveDrugs = saveStoredDrugs;

export const loadFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : ['1', '2', '3']; // Pre-populate top essential items
  } catch {
    return ['1', '2', '3'];
  }
};

export const saveFavorites = (favorites: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites', error);
  }
};

export const loadPrescription = (): PrescriptionItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESCRIPTION_ITEMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const savePrescription = (items: PrescriptionItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTION_ITEMS, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save prescription items', error);
  }
};

export const getStoredPrescriptions = (): Prescription[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredPrescriptions = (prescriptions: Prescription[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
  } catch (error) {
    console.error('Failed to save prescriptions', error);
  }
};

export const exportDatabaseToJSON = (drugs: Drug[]): void => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(drugs, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `yemen_drug_database_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportDataAsJSON = exportDatabaseToJSON;

export const resetDatabaseToDefaults = (): Drug[] => {
  localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(INITIAL_DRUG_DATABASE));
  return INITIAL_DRUG_DATABASE;
};

export const resetToDefaultDatabase = resetDatabaseToDefaults;
