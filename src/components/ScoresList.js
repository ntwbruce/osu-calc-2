import Score from "./Score";
import TableSort from "./ScoreTable";
import styles from "./ScoresList.module.css";

export default function ScoresList({ data }) {
  return (
    <TableSort
      data={data.map((score, index) => {
        return {
          index: index + 1,
          map: `${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}]`,
          mapper: score.beatmapset.creator,
          sr: score.beatmap.difficulty_rating,
          sr_multiplier: score.mods.includes("DT") ||
          score.mods.includes("NC") ||
          score.mods.includes("FL") ||
          score.mods.includes("HR") ||
          score.mods.includes("EZ")
            ? "*"
            : "",
          mods: score.mods.length >= 1 ? `${score.mods.join("")}` : "NM",
          pp: score.pp,
          acc: score.accuracy,
          rank:
            score.rank === "X" || score.rank === "XH"
              ? "SS"
              : score.rank === "SH"
              ? "S"
              : score.rank,
        };
      })}
    />
  );
}
