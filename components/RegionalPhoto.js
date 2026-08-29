const PHOTOS = {
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

export default function RegionalPhoto({ kind = "oldMission", compact = false }) {
  const photo = PHOTOS[kind] ?? PHOTOS.oldMission;
  return (
    <figure className={compact ? "regional-photo compact" : "regional-photo"}>
      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
      <figcaption>
        <span>{photo.caption}</span>
        <small>
          Photo: <a href={photo.source} target="_blank" rel="noopener noreferrer">{photo.credit}</a>
          {" · "}
          <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a>
        </small>
      </figcaption>
    </figure>
  );
}
