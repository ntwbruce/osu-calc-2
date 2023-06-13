import styles from "./UserDetails.module.css";

export default function UserDetails({userData}) {
  const pfp = userData.avatar_url;
  const username = userData.username;
  const playmode =
    userData.playmode === "osu"
      ? "Standard"
      : userData.playmode === "taiko"
      ? "Taiko"
      : userData.playmode === "mania"
      ? "Mania"
      : "Catch";
  const global_rank = userData.statistics.is_ranked
    ? userData.statistics.global_rank
    : "--";
  const country_code = userData.country_code;
  const country_rank = userData.statistics.is_ranked
    ? userData.statistics.country_rank
    : "--";
  const pp = userData.statistics.is_ranked 
    ? userData.statistics.pp
    : '--';
  const acc = userData.statistics.hit_accuracy.toFixed(2);

  return (
    <>
      <img src={pfp} />
      <hr />
      <h2>USERNAME: {username}</h2>
      <h2>MODE: {playmode}</h2>
      <h2>RANK: {global_rank} ({country_code}#{country_rank}) (+0)</h2>
      <h2>PP: {pp}pp (+0.00pp)</h2>
      <h2>ACCURACY: {`${acc}% (+0.00%)`}</h2>
    </>
  );
}
