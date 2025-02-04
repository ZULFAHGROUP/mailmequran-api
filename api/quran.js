const quran = require("quran");
const { getTotalVersesInSurah } = require("../utils");

const generateRandomVerse = () => {
  return new Promise((resolve, reject) => {
    const randomSurah = Math.floor(Math.random() * 114) + 1;
    const totalVerses = getTotalVersesInSurah(randomSurah);
    const randomVerseNumber = Math.floor(Math.random() * totalVerses) + 1;

    quran.select(
      { chapter: randomSurah, verse: randomVerseNumber },
      { language: ["ar", "en"] },
      function (err, verses) {
        if (err) {
          reject(err);
        } else {
          resolve(verses);
        }
      }
    );
  });
};

const getVerses = (surah, verse, verseCount, languages) => {
  return new Promise((resolve, reject) => {
    // a holder to hold the verses
    let result = [];

    // loop through the verses and get the data
    const fetchVerses = () => {
      if (verseCount <= 0) {
        resolve(result); // Resolve the promise once all verses are fetched
        return;
      }

      // get the total number of verses in the surah
      const totalVersesInSurah = getTotalVersesInSurah(surah);

      if (verse > totalVersesInSurah) {
        // Go to the next chapter.
        surah++;
        // Start from the first verse of the new chapter.
        verse = 1;
      }

      // Fetch one verse at a time using the quran.select method
      quran.select(
        { chapter: surah, verse: verse },
        { language: languages },
        function (err, fetchedVerse) {
          if (err) {
            reject(err); // Reject the promise if there's an error
          } else {
            result.push(...fetchedVerse); // Add the fetched verse to the result
            verseCount--; // Reduce the number of verses we still need to fetch
            verse++; // Move to the next verse
            fetchVerses(); // Continue fetching the next verse
          }
        }
      );
    };

    // Start fetching the verses
    fetchVerses();
  });
};

module.exports = {
  getVerses,
  generateRandomVerse,
};
