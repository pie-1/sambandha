/**
 * Daily.co Meeting Service
 * 
 * Handles meeting room creation using Daily.co API
 * For prototype, we're using Jitsi as a free alternative
 */

const axios = require('axios');

// Create a meeting room
const createMeetingRoom = async (draftId, userId) => {
  try {
    // For prototype: Use Jitsi Meet (free, no API key needed)
    // In production: Replace with Daily.co API
    
    const roomName = `Sambandh-${draftId}-${Date.now()}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;
    
    // If using Daily.co (uncomment and add API key)
    // const response = await axios.post(
    //   `${process.env.DAILY_API_URL}/rooms`,
    //   {
    //     name: roomName,
    //     properties: {
    //       enable_chat: true,
    //       enable_screenshare: true,
    //       start_video_off: true,
    //     }
    //   },
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    // return response.data.url;

    return meetingLink;
  } catch (error) {
    console.error('Meeting creation error:', error.message);
    throw new Error('Failed to create meeting room');
  }
};

// Delete meeting room
const deleteMeetingRoom = async (meetingLink) => {
  try {
    // For Daily.co integration
    // const roomName = meetingLink.split('/').pop();
    // await axios.delete(`${process.env.DAILY_API_URL}/rooms/${roomName}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
    //   }
    // });
    
    console.log('Meeting deleted:', meetingLink);
    return true;
  } catch (error) {
    console.error('Delete meeting error:', error.message);
    return false;
  }
};

module.exports = {
  createMeetingRoom,
  deleteMeetingRoom,
};