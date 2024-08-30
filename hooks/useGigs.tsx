import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { GigObject, CustomFilters } from '../types'; // Assume these types are defined elsewhere
import { filterGigsByProximityCustom, filterGigsByStartTimeCustom, filterGigsByGenre } from '../util/helperFunctions';

interface UseGigsResult {
  gigsDataFromHook: GigObject[];
  isLoading: boolean;
  error: string | null;
  filterByProximity: () => void;
  filterByStartTime: () => void;
  applyCustomFilters: (filters: CustomFilters) => void;
  resetFilter: () => void;
  isNearMeActive: boolean;
  isStartingSoonActive: boolean;
}

interface UseGigsParams {
  userLatitude?: number;
  userLongitude?: number;
}

export const useGigs = (params?: UseGigsParams): UseGigsResult => {
  const [allGigs, setAllGigs] = useState<GigObject[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<GigObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [isStartingSoonActive, setIsStartingSoonActive] = useState(false);
  const [customFilters, setCustomFilters] = useState<CustomFilters | null>(null);

  const userLatitude = params?.userLatitude;
  const userLongitude = params?.userLongitude;

  useEffect(() => {
    
     const  gigQuery = collection(db, 'gigs');

    const unsubscribe = onSnapshot(gigQuery, (querySnapshot) => {
      const queriedGigs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        tickets: doc.data().tickets || "",
        venue: doc.data().venue || "Unknown Venue",
        dateAndTime: doc.data().dateAndTime || { seconds: 0, nanoseconds: 0 },
        isFree: doc.data().isFree || false,
        image: doc.data().image || "",
        genre: doc.data().genre || "",
        genreTags: doc.data().genreTags || [],
        gigName: doc.data().gigName || "",
        blurb: doc.data().blurb || "",
        location: doc.data().location || { longitude: 0, latitude: 0 },
        address: doc.data().address || "",
        gigName_subHeader: doc.data().gigName_subHeader || "",
        links: doc.data().links || [],
        ticketPrice: doc.data().ticketPrice || "",
        likes: doc.data().likes || 0,
        likedGigs: doc.data().likedGigs || [],
        savedGigs: doc.data().savedGigs || [],
        city: doc.data().city || "Unknown City",
      }));
      setAllGigs(queriedGigs);
      applyFilters(queriedGigs);
      setIsLoading(false);
    }, (err) => {
      setError('Failed to fetch gigs');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const applyFilters = useCallback((gigs: GigObject[]) => {
    let filteredResult = [...gigs];

    if (customFilters) {
      // Apply distance filter only if distance > 0
      if (customFilters.distance > 0 && userLatitude !== undefined && userLongitude !== undefined) {
        filteredResult = filterGigsByProximityCustom(
          filteredResult,
          userLatitude,
          userLongitude,
          customFilters.distance
        );
      }

      // Apply time interval filter only if timeInterval > 0
      if (customFilters.timeInterval > 0) {
        filteredResult = filterGigsByStartTimeCustom(
          filteredResult,
          customFilters.timeInterval
        );
      }

      // Apply genre filter only if genres are selected
      if (customFilters.genres.length > 0) {
        filteredResult = filterGigsByGenre(filteredResult, customFilters.genres);
      }
    } else {
      // Existing code for non-custom filters (Near Me, Starting Soon)
      if (isNearMeActive && userLatitude !== undefined && userLongitude !== undefined) {
        filteredResult = filterGigsByProximityCustom(filteredResult, userLatitude, userLongitude, 1);
      }

      if (isStartingSoonActive) {
        filteredResult = filterGigsByStartTimeCustom(filteredResult, 30);
      }
    }

    setFilteredGigs(filteredResult);
  }, [isNearMeActive, isStartingSoonActive, customFilters, userLatitude, userLongitude]);

  const filterByProximity = useCallback(() => {
    setIsNearMeActive(prev => !prev);
    setCustomFilters(null);
    applyFilters(allGigs);
  }, [allGigs, applyFilters]);

  const filterByStartTime = useCallback(() => {
    setIsStartingSoonActive(prev => !prev);
    setCustomFilters(null);
    applyFilters(allGigs);
  }, [allGigs, applyFilters]);

  const applyCustomFilters = useCallback((filters: CustomFilters) => {
    setCustomFilters(filters);
    setIsNearMeActive(false);
    setIsStartingSoonActive(false);
    applyFilters(allGigs);
  }, [allGigs, applyFilters]);

  const resetFilter = useCallback(() => {
    setIsNearMeActive(false);
    setIsStartingSoonActive(false);
    setCustomFilters(null);
    setFilteredGigs(allGigs);
  }, [allGigs]);

  useEffect(() => {
    applyFilters(allGigs);
  }, [isNearMeActive, isStartingSoonActive, customFilters, allGigs, applyFilters]);

  return { 
    gigsDataFromHook: filteredGigs, 
    isLoading, 
    error, 
    filterByProximity, 
    filterByStartTime, 
    applyCustomFilters,
    resetFilter,
    isNearMeActive,
    isStartingSoonActive
  };
};