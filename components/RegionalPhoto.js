import { PHOTOS } from "@/lib/regional-photos";

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
