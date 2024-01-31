import React, { useState, useEffect } from 'react';

const YourComponent = () => {
  const [url, setUrl] = useState(null);
  const apiKey = 'AIzaSyDQf_SRcqfs5esNa12UmFfyVxL-Dul8-9A';
  const [totalDuration, setTotalDuration] = useState('00:00:00');
  const [loading, setLoading] = useState(false);
  const fetchPlaylistData = async (e) => {
    e.preventDefault();
    const listId = await parseUrl(url)
    setLoading(true)
    try {
      let nextPageToken = '';
      let totalSeconds = 0;

      // Fetch playlist data
      do {
        const playlistResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${listId}&part=snippet&key=${apiKey}&fields=nextPageToken,items(snippet(publishedAt,title,description,thumbnails(medium),position,resourceId(videoId)))&maxResults=50&pageToken=${nextPageToken}`
        );
        const playlistData = await playlistResponse.json();
        console.log(playlistData)
        // Fetch video durations
        for (const item of playlistData.items) {
          const videoId = item.snippet.resourceId.videoId;
          const videoDetailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&maxResults=50&fields=items(id,contentDetails(duration))&key=${apiKey}`
          );
          const videoDetailsData = await videoDetailsResponse.json();
          const duration = videoDetailsData.items[0].contentDetails.duration;
          const seconds = parseDuration(duration);
          totalSeconds += seconds;
        }

        nextPageToken = playlistData.nextPageToken;
      } while (nextPageToken);

      // Convert total seconds to HH:MM:SS format
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setLoading(false)
      animateDuration(hours, minutes, seconds);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false)
    }

  }


  //Animation 
  const animateDuration = (hours, minutes, seconds) => {
    setTotalDuration('00:00:00'); // Reset to zero before animating

    const startTime = Date.now();
    const animationDuration = 1000; // 3 seconds animation duration
    const endTime = startTime + animationDuration;

    const updateTotalDuration = () => {
      const currentTime = Date.now();
      const progress = Math.min(1, (currentTime - startTime) / animationDuration);
      const interpolatedValue = formatTime(
        interpolateTime('00:00:00', `${hours}:${minutes}:${seconds}`, progress)
      );

      setTotalDuration(interpolatedValue);

      if (progress < 1) {
        requestAnimationFrame(updateTotalDuration);
      }
    };

    requestAnimationFrame(updateTotalDuration);
  };

  const interpolateTime = (start, end, progress) => {
    const startTime = timeToSeconds(start);
    const endTime = timeToSeconds(end);
    const interpolatedTime = startTime + (endTime - startTime) * progress;
    return secondsToTime(Math.round(interpolatedTime));
  };

  const timeToSeconds = (time) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const secondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  };

  const formatTime = (time) => {
    // You can add additional formatting logic if needed
    return time;
  };

  const padZero = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  // Helper function to parse duration in PT#H#M#S format
  const parseDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  };
  const parseUrl = (url) => {
    // Extract playlist ID
    const playlistIdMatch = url.match(/[?&]list=([^&]+)/);
    if (playlistIdMatch) {
      // Check for additional parameters after 'list'
      const playlistIdWithParams = playlistIdMatch[1];
      const fixedLengthPlaylistIdMatch = playlistIdWithParams.match(/^([^&]+)/);

      if (fixedLengthPlaylistIdMatch) {
        var playlistId = fixedLengthPlaylistIdMatch[1];
      }
    }
    return playlistId;
  }
  useEffect(() => {
    // Simulating data loading or any other async operation
    if (loading) {
      const interval = setInterval(() => {
        setTotalDuration(totalDuration + 20); // Set your desired total duration
        setLoading(false);
      }, 200); // Adjust the delay based on your needs

      clearInterval(interval)
    }

  }, [loading]);


  return (
    <div>
      <h2 className='text-center text-4xl mt-3 mb-8'>Youtube Playlist Calculator</h2>
      <form onSubmit={fetchPlaylistData} className='flex flex-col gap-y-5 text-center'>
        <label className='text-lg' htmlFor="">Youtube Playlist Link</label>
        <input className='text-lg max-w-screen-md w-11/12 m-auto p-4 outline-none' type="text" onChange={(e) => { setUrl(e.target.value) }} placeholder='https://www.youtube.com/playlist?list=PLu0W_9lII9agpFUAlPFe_VNSlXW5uE0YL' />
        <button className='w-min max-w-2xl m-auto bg-red-700 py-1 px-4 flex items-center' type='submit'>Search <svg className='ml-2' id="SvgjsSvg1001" width="30" height="30" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1002"></defs><g id="SvgjsG1008"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30"><path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="m3.5 20.5 17-17M9.5 3.5h11v11" data-name="Arrow 2 Left Up" className="colorStroke303c42 svgStroke"></path></svg></g></svg></button>
      </form>
      {loading?
      <div class="loading max-w-screen-md w-11/12 m-auto bg-[#3b3a3a] h-2.5 mt-8 mb-2">
        <div class="loading-in bg-red-700 h-2.5 " style={{width: "35%"}}></div>
      </div> : <h2 className='text-center mt-8'>Total Playlist Duration:</h2>}

      <p className='text-center text-4xl'>{loading? "" : totalDuration}</p>

    </div>
  );
};

export default YourComponent;