import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { GigObject } from '../routes/homeStack';
import { filterGigsByProximity } from '../util/helperFunctions';

export interface Time {
  nanoseconds: number;
  seconds: number;
}

interface UseGigsResult {
  gigsDataFromHook: GigObject[];
  isLoading: boolean;
  error: string | null;
  filterByProximity: () => void;
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
      setFilteredGigs(queriedGigs);
      setIsLoading(false);
    }, (err) => {
      setError('Failed to fetch gigs');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userCity]);

  const filterByProximity = useCallback(() => {
    if (userLatitude !== undefined && userLongitude !== undefined) {
      try {
        const nearbyGigs = filterGigsByProximity(
          allGigs,
          userLatitude,
          userLongitude,
          1 // 1km radius, adjust as needed
        );
        setFilteredGigs(nearbyGigs);
      } catch (err) {
        setError('Failed to filter gigs by proximity');
      }
    } else {
      setError('User coordinates are not available');
    }
  }, [allGigs, userLatitude, userLongitude]);

  const resetFilter = useCallback(() => {
    setFilteredGigs(allGigs);
  }, [allGigs]);

  return { gigsDataFromHook: filteredGigs, isLoading, error, filterByProximity, resetFilter };
};