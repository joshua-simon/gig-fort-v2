import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { GigObject } from '../routes/homeStack';
import { filterGigsByProximity, filterGigsByStartTime, filterGigsByGenre } from '../util/helperFunctions';

export interface Time {
  nanoseconds: number;
  seconds: number;
}

export interface CustomFilters {
  timeFrame: number;
  distance: number;
  genres: string[];
}

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
  customFilters: CustomFilters | null;
}

interface UseGigsParams {
  userCity?: string;
  userLatitude?: number;
  userLongitude?: number;
}

export const useGigs = ({ userCity, userLatitude, userLongitude }: UseGigsParams): UseGigsResult => {
  const [allGigs, setAllGigs] = useState<GigObject[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<GigObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [isStartingSoonActive, setIsStartingSoonActive] = useState(false);
  const [customFilters, setCustomFilters] = useState<CustomFilters | null>(null);

  useEffect(() => {
    let gigQuery;

    if (userCity && userCity.trim() !== "") {
      gigQuery = query(collection(db, 'gigs'), where('city', '==', userCity));
    } else {
      gigQuery = collection(db, 'gigs');
    }

    const unsubscribe = onSnapshot(gigQuery, (querySnapshot) => {
      const queriedGigs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        tickets: doc.data().tickets || "",
        venue: doc.data().venue || "Unknown Venue",
        dateAndTime: doc.data().dateAndTime || { seconds: 0, nanoseconds: 0 },
        isFree: doc.data().isFree || false,
        image: doc.data().image || "",
        genre: doc.data().genre || "",
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
  }, [userCity]);

  const applyFilters = useCallback((gigs: GigObject[]) => {
    let filteredResult = [...gigs];

    if (isNearMeActive && userLatitude !== undefined && userLongitude !== undefined) {
      filteredResult = filterGigsByProximity(
        filteredResult, 
        userLatitude, 
        userLongitude, 
        customFilters?.distance || 1
      );
    }

    if (isStartingSoonActive || customFilters?.timeFrame) {
      filteredResult = filterGigsByStartTime(
        filteredResult, 
        customFilters?.timeFrame || 30
      );
    }

    if (customFilters?.genres.length) {
      filteredResult = filterGigsByGenre(filteredResult, customFilters.genres);
    }

    setFilteredGigs(filteredResult);
  }, [isNearMeActive, isStartingSoonActive, customFilters, userLatitude, userLongitude]);

  const filterByProximity = useCallback(() => {
    setIsNearMeActive(prev => !prev);
    applyFilters(allGigs);
  }, [allGigs, applyFilters]);

  const filterByStartTime = useCallback(() => {
    setIsStartingSoonActive(prev => !prev);
    applyFilters(allGigs);
  }, [allGigs, applyFilters]);

  const applyCustomFilters = useCallback((filters: CustomFilters) => {
    setCustomFilters(filters);
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
    isStartingSoonActive,
    customFilters
  };
};