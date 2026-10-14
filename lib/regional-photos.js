// Licensed regional photography (Wikimedia Commons), with visible credit wherever it is shown.
export const PHOTOS = {
  oldMission: {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/63/Old_Mission_Peninsula.jpg",
    alt: "Vineyard rows on Old Mission Peninsula above Grand Traverse Bay near Traverse City, Michigan",
    caption: "Old Mission Peninsula vineyard and Grand Traverse Bay",
    credit: "stanthejeep",
    source: "https://commons.wikimedia.org/wiki/File:Old_Mission_Peninsula.jpg",
    license: "CC BY-SA 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5/",
  },
  leelanau: {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Leelanau_vineyard.jpg",
    alt: "Green vineyard rows on the Leelanau Peninsula in northern Michigan",
    caption: "Vineyard on the Leelanau Peninsula",
    credit: "Iulus Ascanius",
    source: "https://commons.wikimedia.org/wiki/File:Leelanau_vineyard.jpg",
    license: "Public domain",
    licenseUrl: "https://commons.wikimedia.org/wiki/File:Leelanau_vineyard.jpg#Licensing",
  },
  chateau: {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/f2/ChateauChantal.JPG",
    alt: "Chateau Chantal vineyard and tasting room overlooking Grand Traverse Bay on Old Mission Peninsula",
    caption: "Chateau Chantal on Old Mission Peninsula",
    credit: "Chateau Chantal",
    source: "https://commons.wikimedia.org/wiki/File:ChateauChantal.JPG",
    license: "Attribution license",
    licenseUrl: "https://commons.wikimedia.org/wiki/File:ChateauChantal.JPG#Licensing",
  },
};

/** Wikimedia thumbnail of a commons file at a standard step width (much lighter than the original). */
export function photoThumb(photo, width = 960) {
  const m = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f]\/[0-9a-f]{2})\/([^/]+)$/.exec(photo.src);
  return m ? `${m[1]}/thumb/${m[2]}/${m[3]}/${width}px-${m[3]}` : photo.src;
}
