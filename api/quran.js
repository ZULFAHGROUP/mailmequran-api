const quran = require("quran");

const getMultipleVerses = (surah, nextVerse, verseCount) => {
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


module.exports = {
  getMultipleVerses,
};
