const quran = require("quran");

const getMultipleVerses = async (surah, nextVerse, verseCount) => {
  let verseToGet = [];

  for (let i = nextVerse; i <= nextVerse + verseCount; i++) {
    verseToGet.push(i);
  }

  quran.select(
    { chapter: surah, verse: verseToGet },
    { language: ["en", "ar"] },
    function (err, verses) {
      if (!err) {
        console.log(verses);
      } else {
        console.error(err);
      }
    }
  );
};


module.exports = {
  getMultipleVerses,
};
