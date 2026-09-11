const BASE = "/media/events/2026/08";

const clips = [
  {
    name: "lc-workshop-clip",
    title: "Mentor review session",
    caption:
      "A mentor at a table with a rocket nose cone and body tube, walking students through the build over a laptop.",
    // Landscape 1280x720
    modifier: "work-gallery__item--wide",
  },
  {
    name: "lc-conference-clip",
    title: "Launch crew on the floor",
    caption:
      "Launch Crew shirts around a red rocket on the prep table, under the arena scoreboard and Canadian flag.",
    // Portrait 720x1280
    modifier: "work-gallery__item--tall",
  },
];

export function LaunchCanadaVideos() {
  return (
    <section className="sx-page-body sx-page-body--tight">
      <div className="wrap">
        <div className="sx-page-intro">
          <p className="section-eyebrow">Clips</p>
          <h2>Short clips from Launch Canada 2026.</h2>
        </div>
        <div className="work-gallery__grid">
          {clips.map((clip) => (
            <figure
              key={clip.name}
              className={`work-gallery__item ${clip.modifier}`}
            >
              <video
                controls
                muted
                playsInline
                preload="metadata"
                poster={`${BASE}/${clip.name}.jpg`}
                src={`${BASE}/${clip.name}.mp4`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <figcaption style={{ pointerEvents: "none" }}>
                <span>{clip.title}</span>
                <small>{clip.caption}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
