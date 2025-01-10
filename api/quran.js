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

const getVerses = async (surah, verse, verseCount, languages) => {
  try {
    // a holder to hold the verses
    let result = [];
    //loop through the verses and get the data
    while (verseCount > 0) {
      // get the total number of verse in the surah
      const totalVersesInSurah = getTotalVersesInSurah(surah);
      if (verse > totalVersesInSurah) {
        // Go to the next chapter.
        surah++;
        // Start from the first verse of the new chapter.
        verse = 1;
      }

      // Fetch one verse at a time
      const fetchedVerse = await quran.select(
        { chapter: surah, verse: [verse] },
        { language: languages }
      );

      // Add the fetched verse to the list.
      result.push(...fetchedVerse);

      // Reduce the number of verses we still need to fetch.
      verseCount--;

      // Move to the next verse
      verse++;

      // If we reach the end of the chapter, move to the next chapter
    }

    return result;
  } catch (error) {
    console.log(error);
  }
};




 



module.exports = {
  getVerses,
  generateRandomVerse,
};
