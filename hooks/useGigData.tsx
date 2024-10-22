import { useState, useEffect } from 'react';
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

export const useGigData = (gigId: string, userId: string) => {
    const [isGigSaved, setIsGigSaved] = useState(false);
    const [likes, setLikes] = useState(0);
    const [isNotified, setIsNotified] = useState(false);
    const [isGigLiked, setIsGigLiked] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [error, setError] = useState<FirestoreError | null>(null);
    const [gigData, setGigData] = useState<any>(null);
    const [isReminderPopupVisible, setIsReminderPopupVisible] = useState(false);

    const { scheduleNotification, cancelNotification, notificationError, permissionStatus } = useNotifications();

    useEffect(() => {
        if (notificationError) {
            console.error("Notification error:", notificationError);
        }
    }, [notificationError]);

    useEffect(() => {
        if (!gigId) return;

        const gigRef = doc(db, "gigs", gigId);
    
        const unsubscribe = onSnapshot(gigRef, (gigSnapshot) => {
          const data = gigSnapshot.data();

          if (data) {
            setLikes(data.likes || 0);
            setGigData(data);
          }
        }, (err) => {
          setError(err);
        });
    
        let unsubscribeUser: () => void;
        if (userId) {
          const userRef = doc(db, 'users', userId);
          unsubscribeUser = onSnapshot(userRef, (userSnapshot) => {
            const userData = userSnapshot.data();
            
            if (userData) {
              setIsGigLiked(userData.likedGigs?.includes(gigId) ?? false);
              setIsGigSaved(userData.savedGigs?.includes(gigId) ?? false);
              setIsNotified(userData.notifiedGigs?.includes(gigId) ?? false);
            }
          }, (err: FirestoreError) => {
            setError(err);
          });
        }

        return () => {
          unsubscribe();
          if (unsubscribeUser) {
            unsubscribeUser();
          }
        };
    }, [gigId, userId]);

    const toggleSaveGig = async () => {
        if (!userId) return;
        try {
            if (isGigSaved) {
                await removeSavedGig(gigId, userId);
            } else { 
                await addSavedGigs(gigId, userId);
            }
            setIsGigSaved(!isGigSaved);
        } catch (error) {
            console.error("Error toggling save gig", error);
            setError(error as FirestoreError);
        }
    };
    
    const toggleLiked = async () => {
        if (!userId) return;
        try {
            if (isGigLiked) {
                await decrementLikesByOne(gigId);
                await removeLikedGigIDfromUser(gigId, userId);
            } else {
                await incrementLikesByOne(gigId);
                await addLikedGigIDtoUser(gigId, userId);
            }
            setIsGigLiked(!isGigLiked);
        } catch (error) {
            console.error("Error toggling like", error);
            setError(error as FirestoreError);
        }
    };

    const showPopup = () => {
      setPopupVisible(true);
      setTimeout(() => {
        setPopupVisible(false);
      }, 3000);
    };

    const showReminderPopup = () => {
        setIsReminderPopupVisible(true);
    };

    const hideReminderPopup = () => {
        setIsReminderPopupVisible(false);
    };

// In useGigData.ts
// Modify the setNotification function:

const setNotification = async (minutes: number) => {
    if (!userId || !gigData) return;
    
    // Check if we have notification permission
    if (permissionStatus !== 'granted') {
        // Silently return without showing error
        return;
    }

    const userRef = doc(db, "users", userId);
    try {
        await updateDoc(userRef, {
            notifiedGigs: arrayUnion(gigId)
        });
        setIsNotified(true);
        
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
};

    const cancelNotificationForGig = async () => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        try {
            await updateDoc(userRef, {
                notifiedGigs: arrayRemove(gigId)
            });
            setIsNotified(false);
            await cancelNotification(gigId);
        } catch (error) {
            console.error("Error cancelling notification", error);
            setError(error as FirestoreError);
        }
    };

    return {
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
    };
};