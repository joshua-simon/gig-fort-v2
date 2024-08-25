import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { GigObject } from '../routes/homeStack';
import { filterGigsByProximity, filterGigsByStartTime } from '../util/helperFunctions';

export interface Time {
  nanoseconds: number;
  seconds: number;
}

interface UseGigsResult {
  gigsDataFromHook: GigObject[];
  isLoading: boolean;
  error: string | null;
  isNearMeActive:any,
  isStartingSoonActive: any,
  filterByProximity: () => void;
  filterByStartTime: () => void;
  resetFilter: () => void;
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
      filteredResult = filterGigsByProximity(filteredResult, userLatitude, userLongitude, 1);
    }

    if (isStartingSoonActive) {
      filteredResult = filterGigsByStartTime(filteredResult, 30);
    }

    setFilteredGigs(filteredResult);
  }, [isNearMeActive, isStartingSoonActive, userLatitude, userLongitude]);

  const filterByProximity = useCallback(() => {
    setIsNearMeActive(prev => !prev);
    applyFilters(allGigs);
  }, [allGigs, applyFilters]);

  const filterByStartTime = useCallback(() => {
    setIsStartingSoonActive(prev => !prev);
    applyFilters(allGigs);
  }, [allGigs, applyFilters]);

  const resetFilter = useCallback(() => {
    setIsNearMeActive(false);
    setIsStartingSoonActive(false);
    setFilteredGigs(allGigs);
  }, [allGigs]);

  useEffect(() => {
    applyFilters(allGigs);
  }, [isNearMeActive, isStartingSoonActive, allGigs, applyFilters]);

  return { 
    gigsDataFromHook: filteredGigs, 
    isLoading, 
    error, 
    filterByProximity, 
    filterByStartTime, 
    resetFilter,
    isNearMeActive,
    isStartingSoonActive
  };
};