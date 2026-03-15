import axios from 'axios';

export const sendWhatsappMessage = async (phone, msg) => {
  try {
    // Ensure number has country code for India if missing
    let targetPhone = phone;
    if (!targetPhone.startsWith('+')) {
      targetPhone = '+91' + targetPhone;
    }

    const response = await axios.post(
      'http://13.233.83.235:3000/send-message',
      {
        apiKey:
          process.env.AIRTEXT_API_KEY || '9510ad40-9c45-4ac2-a03e-6ac71bd906e5', 
        phone: targetPhone,
        msg: msg,
        type: 'whatsapp',
      },
    );

    return response.data;
  } catch (error) {
    console.error('AirText Notification Error:', error.message);
    // Hum error throw nahi kar rahe taaki app crash na ho agar SMS fail ho jaye
    return false;
  }
};
