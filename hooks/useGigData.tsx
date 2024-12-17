import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, FirestoreError, onSnapshot, arrayUnion, arrayRemove, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import {
    incrementLikesByOne,
    addLikedGigIDtoUser,
    removeSavedGig,
    addSavedGigs,
    decrementLikesByOne,
    removeLikedGigIDfromUser
} from "./databaseFunctions";
import { useNotifications } from './useNotifications';

// Separate interface for gig data to improve type safety
interface GigData {
    likes: number;
    gigName: string;
    venue: string;
    dateAndTime: {
        seconds: number;
    };
    [key: string]: any;
}

export const useGigData = (gigId: string, userId: string) => {
    const [isGigSaved, setIsGigSaved] = useState(false);
    const [likes, setLikes] = useState(0);
    const [isNotified, setIsNotified] = useState(false);
    const [isGigLiked, setIsGigLiked] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [error, setError] = useState<FirestoreError | null>(null);
    const [gigData, setGigData] = useState<GigData | null>(null);
    const [isReminderPopupVisible, setIsReminderPopupVisible] = useState(false);

    const { scheduleNotification, cancelNotification, notificationError, permissionStatus } = useNotifications();

    // Memoize document references
    const gigRef = useMemo(() => gigId ? doc(db, "gigs", gigId) : null, [gigId]);
    const userRef = useMemo(() => userId ? doc(db, "users", userId) : null, [userId]);

    // Handle notification errors
    useEffect(() => {
        if (notificationError) {
            console.error("Notification error:", notificationError);
        }
    }, [notificationError]);

    // Setup snapshots for gig and user data
    useEffect(() => {
        if (!gigRef) return;

        const unsubscribe = onSnapshot(gigRef, (gigSnapshot) => {
            const data = gigSnapshot.data() as GigData;
            if (data) {
                setLikes(data.likes || 0);
                setGigData(data);
            }
        }, (err) => {
            setError(err);
        });

        return () => unsubscribe();
    }, [gigRef]);

    useEffect(() => {
        if (!userRef) return;

        const unsubscribe = onSnapshot(userRef, (userSnapshot) => {
            const userData = userSnapshot.data();
            if (userData) {
                setIsGigLiked(userData.likedGigs?.includes(gigId) ?? false);
                setIsGigSaved(userData.savedGigs?.includes(gigId) ?? false);
                setIsNotified(userData.notifiedGigs?.includes(gigId) ?? false);
            }
        }, (err: FirestoreError) => {
            setError(err);
        });

        return () => unsubscribe();
    }, [userRef, gigId]);

    // Memoize handlers to prevent unnecessary re-renders
    const toggleSaveGig = useCallback(async () => {
        if (!userId || !userRef) return;
        
        try {
            if (isGigSaved) {
                await removeSavedGig(gigId, userId);
            } else {
                await addSavedGigs(gigId, userId);
            }
        } catch (error) {
            console.error("Error toggling save gig", error);
            setError(error as FirestoreError);
        }
    }, [userId, gigId, isGigSaved, userRef]);

    const toggleLiked = useCallback(async () => {
        if (!userId || !gigRef) return;
        
        try {
            const updates = isGigLiked
                ? [decrementLikesByOne(gigId), removeLikedGigIDfromUser(gigId, userId)]
                : [incrementLikesByOne(gigId), addLikedGigIDtoUser(gigId, userId)];
            
            await Promise.all(updates);
        } catch (error) {
            console.error("Error toggling like", error);
            setError(error as FirestoreError);
        }
    }, [userId, gigId, isGigLiked, gigRef]);

    const showPopup = useCallback(() => {
        setPopupVisible(true);
        setTimeout(() => setPopupVisible(false), 3000);
    }, []);

    const showReminderPopup = useCallback(() => {
        setIsReminderPopupVisible(true);
    }, []);

    const hideReminderPopup = useCallback(() => {
        setIsReminderPopupVisible(false);
    }, []);

    const setNotification = useCallback(async (minutes: number) => {
        if (!userId || !gigData || !userRef || permissionStatus !== 'granted') return;

        try {
            await updateDoc(userRef, {
                notifiedGigs: arrayUnion(gigId)
            });

            if (gigData.dateAndTime) {
                const notificationDate = new Date(gigData.dateAndTime.seconds * 1000);
                notificationDate.setMinutes(notificationDate.getMinutes() - minutes);

                const notificationId = await scheduleNotification(
                    {
                        title: `Upcoming Gig: ${gigData.gigName}`,
                        body: `Don't forget! ${gigData.gigName} is starting in ${minutes} minutes at ${gigData.venue}`,
                        data: { gigId }
                    },
                    { date: notificationDate }
                );

                if (notificationId) {
                    console.log("Notification scheduled with ID:", notificationId);
                }
            }

            showPopup();
        } catch (error) {
            console.error("Error setting notification", error);
            setError(error as FirestoreError);
        }
    }, [userId, gigId, gigData, userRef, permissionStatus, showPopup]);

    const cancelNotificationForGig = useCallback(async () => {
        if (!userId || !userRef) return;
        
        try {
            await updateDoc(userRef, {
                notifiedGigs: arrayRemove(gigId)
            });
            await cancelNotification(gigId);
        } catch (error) {
            console.error("Error cancelling notification", error);
            setError(error as FirestoreError);
        }
    }, [userId, gigId, userRef, cancelNotification]);

    // Memoize returned object to prevent unnecessary re-renders
    return useMemo(() => ({
        isGigSaved,
        toggleSaveGig,
        likes,
        toggleLiked,
        isNotified,
        showReminderPopup,
        hideReminderPopup,
        setNotification,
        cancelNotificationForGig,
        isGigLiked,
        isPopupVisible,
        isReminderPopupVisible,
        error,
        permissionStatus
    }), [
        isGigSaved,
        toggleSaveGig,
        likes,
        toggleLiked,
        isNotified,
        showReminderPopup,
        hideReminderPopup,
        setNotification,
        cancelNotificationForGig,
        isGigLiked,
        isPopupVisible,
        isReminderPopupVisible,
        error,
        permissionStatus
    ]);
};