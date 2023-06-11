import styles from "./Score.module.css";

function Score({ idx, scoreData }) {
  const artist = scoreData.beatmapset.artist;
  const title = scoreData.beatmapset.title;
  const diff_name = scoreData.beatmap.version;
  const mapper = scoreData.beatmapset.creator;
  const sr = scoreData.beatmap.difficulty_rating;
  const mods = scoreData.mods.length >= 1 ? `+${scoreData.mods.join("")}` : "";
  const isDT = mods.includes("DT");
  const pp = scoreData.pp ? scoreData.pp.toFixed(2) : "--";
  const acc = (scoreData.accuracy * 100).toFixed(2);
  const rank =
    scoreData.rank === "X" || scoreData.rank === "XH"
      ? "SS"
      : scoreData.rank === "SH"
      ? "S"
      : scoreData.rank;

  return (
    <>
      <h3>
        {idx + 1} {artist} - {title} [{diff_name}] ({mapper} | {sr}
        {isDT ? "+" : ""}*) {mods} {acc}% {rank} | {pp}pp
      </h3>
    </>
  );
}

export default Score;
