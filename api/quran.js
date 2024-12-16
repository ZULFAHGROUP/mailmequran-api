const quran = require("quran");
const { getTotalVersesInSurah } = require("../utils");

const getMultipleVersesWithEnglishAndArabic = (
  surah,
  nextVerse,
  verseCount
) => {
  return new Promise((resolve, reject) => {
    let verseToGet = [];
    for (let i = nextVerse; i < nextVerse + verseCount; i++) {
      verseToGet.push(i);
    }

    quran.select(
      { chapter: surah, verse: verseToGet },
      { language: ["en", "ar"] },
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

const getMultipleVersesWithArabic = (surah, nextVerse, verseCount) => {
  return new Promise((resolve, reject) => {
    let verseToGet = [];
    for (let i = nextVerse; i < nextVerse + verseCount; i++) {
      verseToGet.push(i);
    }

    quran.select(
      { chapter: surah, verse: verseToGet },
      { language: ["ar"] },
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

module.exports = {
  getMultipleVersesWithEnglishAndArabic,
  getMultipleVersesWithArabic,
  generateRandomVerse,
};
