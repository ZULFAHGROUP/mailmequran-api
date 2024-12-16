const quran = require("quran");

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

module.exports = {
  getMultipleVersesWithEnglishAndArabic,
  getMultipleVersesWithArabic,
};
