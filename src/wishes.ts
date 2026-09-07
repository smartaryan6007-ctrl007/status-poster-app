import type { Wish } from '@/types';

// Wishes per template id — each has a Hindi and English variant.
// Inspire Wish picks one at random.
export const WISHES: Record<string, Wish[]> = {
  diwali: [
    { lang: 'hi', text: 'दीपों का ये त्योहार लाए,\nखुशियों का एक नया सवेरा।\nआपका जीवन हमेशा रौशन रहे,\nयही है दीपावली का उपहार भरा।' },
    { lang: 'en', text: 'May this festival of lights,\nBring a new dawn of joy.\nMay your life always shine bright,\nHappy Diwali, every girl and boy.' },
  ],
  birthday: [
    { lang: 'hi', text: 'जन्मदिन का ये खास दिन,\nलाए खुशियों का नया संसार।\nहर दिन धखे आपकी मुस्कान,\nयही है मेरी शुभकामना प्यार।' },
    { lang: 'en', text: 'On this special day of yours,\nMay happiness be your guide.\nMay your smile bloom like flowers,\nWith joy you can never hide.' },
  ],
  goodmorning: [
    { lang: 'hi', text: 'सुबह की ये सुनहरी किरण,\nलाए आपके चेहरे पे मुस्कान।\nआज का दिन हो खास ऐसा,\nहर पल रहे आप खुश हमेशा।' },
    { lang: 'en', text: 'The golden rays of morning light,\nMay they fill your heart with cheer.\nWishing you a day so bright,\nWith joy that lasts all year.' },
  ],
  holi: [
    { lang: 'hi', text: 'रंगों का ये उत्सव आया,\nहर तरफ खुशियां छाई।\nगुलाल उड़े, प्यार बरसे,\nहोली मुबारक हो भाई।' },
    { lang: 'en', text: 'The festival of colors is here,\nLet joy fill the air around.\nMay laughter and love draw near,\nIn every hue, let love be found.' },
  ],
  christmas: [
    { lang: 'hi', text: 'क्रिसमस की ये खुशियां,\nलाए आपके दिल में रौशनी।\nहर दिल में बसे प्यार,\nयही है ईद की मेहरबानी।' },
    { lang: 'en', text: 'On this holy Christmas night,\nMay peace fill every heart.\nMay your home be warm and bright,\nWith love that never parts.' },
  ],
  newyear: [
    { lang: 'hi', text: 'नए साल का ये पहला पल,\nलाए नई उम्मीद, नया सवेरा।\nहर ख्वाब पूरा हो ऐसा,\nयही है मेरी शुभकामना भरा।' },
    { lang: 'en', text: 'A new year begins with hope,\nLike a fresh dawn of spring.\nMay every dream find its scope,\nAnd joy to your life it brings.' },
  ],
  eid: [
    { lang: 'hi', text: 'ईद का ये पाक त्योहार,\nलाए खुशियों का दौर।\nदुआओं में भरा हर पल,\nआपका जीवन हो सुहाना और।' },
    { lang: 'en', text: 'Eid brings a message of love,\nWith blessings from above.\nMay this sacred day bring cheer,\nAnd joy that lasts all year.' },
  ],
  mothersday: [
    { lang: 'hi', text: 'माँ के दोनों आंखों में,\nबसा है एक नया संसार।\nउसके प्यार का कोई मोल नहीं,\nयही है सबसे बड़ा उपहार।' },
    { lang: 'en', text: "A mother's love is pure and deep,\nA treasure that forever glows.\nOn this special day we keep,\nThe gratitude that in us grows." },
  ],
  republicday: [
    { lang: 'hi', text: 'गणतंत्र दिवस का ये दिन,\nयाद दिलाए हमें अपनी आन।\nतिरंगा लहराए आसमान में,\nदेश की शान बढ़े जहां।' },
    { lang: "en", text: "On this Republic Day so grand,\nWe honor our nation's pride.\nTogether we stand, united as one,\nWith the tricolor by our side." },
  ],
  independenceday: [
    { lang: 'hi', text: 'आजादी का ये पाक दिन,\nयाद दिलाए शहीदों को।\nदेश की आन के लिए,\nउन्होंने दी जान अपनी।' },
    { lang: "en", text: "On Independence Day we recall,\nThe brave who gave their all.\nWith freedom's flag held high,\nWe honor their legacy with pride." },
  ],
};

export function getRandomWish(templateId: string): string {
  const pool = WISHES[templateId] ?? WISHES.goodmorning;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.text;
}
