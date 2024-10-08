import { format, addDays, isSameDay, startOfDay } from "date-fns";


export const getGigsToday = (gigArray: any[], currentDate: number) => {
  const currentDateTime = new Date(currentDate); 

  const currentDayGigs = gigArray.filter((gig) => {
    const gigDateTime = new Date(gig.dateAndTime.seconds * 1000); 
    return isSameDay(gigDateTime, currentDateTime);
  });

  return currentDayGigs;
};

export const getGigsThisWeek = (gigsArray: any[], currentDate: number) => {
  const weekFromNow = addDays(currentDate, 7);

  const gigsThisWeek = gigsArray.filter((gig) => {
    const gigDate = new Date(gig.dateAndTime.seconds * 1000);
    return (
      gigDate < weekFromNow && gig.dateAndTime.seconds * 1000 >= currentDate
    );
  });

  const gigsThisWeek_sorted = gigsThisWeek.sort(
    (a, b) => a.dateAndTime.seconds - b.dateAndTime.seconds
  );

  const gigsThisWeek_newDate = gigsThisWeek_sorted.map((item) => {
    const formattedDate = format(new Date(item.dateAndTime.seconds * 1000), "EEE LLL do y");
    return { ...item, titleDate: formattedDate };
  });

  const gigsThisWeek_grouped = gigsThisWeek_newDate.reduce((acc, curr) => {
    if (acc[curr.titleDate]) {
      acc[curr.titleDate].push(curr);
    } else {
      acc[curr.titleDate] = [curr];
    }
    return acc;
  }, {});

  return gigsThisWeek_grouped;
};

export const getNextSevenDays = () => {
  const currentDate = new Date();
  const dates = [];

  // Get the start of the current day
  const startOfCurrentDay = startOfDay(currentDate);

  // Get the previous day
  const previousDate = addDays(startOfCurrentDay, -1);
  dates.push(previousDate);

  // Get the current day
  dates.push(startOfCurrentDay);

  // Get the next five days
  for (let i = 1; i <= 5; i++) {
    const nextDate = addDays(startOfCurrentDay, i);
    dates.push(nextDate);
  }

  return dates;
};

export const getDistanceFromLatLonInKm = (lat1:number, lon1:number, lat2:number, lon2:number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg:any) {
  return deg * (Math.PI/180)
}

export const filterGigsByProximity = (
  gigs,
  userLatitude: number,
  userLongitude: number,
  radiusKm: number = 1
)  => {
  return gigs.filter(gig => {
    const distance = getDistanceFromLatLonInKm(
      userLatitude,
      userLongitude,
      gig.location.latitude,
      gig.location.longitude
    );
    return distance <= radiusKm;
  });
}

export const filterGigsByStartTime = (gigs, minutesThreshold: number = 30) => {
  const now = new Date().getTime() / 1000; // Current time in seconds
  const threshold = now + minutesThreshold * 60; // Threshold time in seconds

  return gigs.filter(gig => {
    const gigTime = gig.dateAndTime.seconds;
    return gigTime >= now && gigTime <= threshold;
  });
};

export const filterGigsByStartTimeCustom = (gigs, minutesThreshold: number = 30) => {
  const now = new Date().getTime() / 1000;
  const threshold = now + minutesThreshold * 60;

  return gigs.filter(gig => {
    const gigTime = gig.dateAndTime.seconds;
    return gigTime >= now && gigTime <= threshold;
  });
};

export const filterGigsByProximityCustom = (gigs, userLat: number, userLon: number, radiusKm: number = 1) => {
  return gigs.filter(gig => {
    const distance = getDistanceFromLatLonInKm(userLat, userLon, gig.location.latitude, gig.location.longitude);
    return distance <= radiusKm;
  });
};

export const filterGigsByGenre = (gigs, genres: string[]) => {
  return gigs.filter(gig => 
    gig.genreTags.some(tag => genres.includes(tag))
  );
};

