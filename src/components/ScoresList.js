import Score from "./Score";
import styles from './ScoresList.module.css';

function ScoresList({data}) {
  if (data.length === 0) {
    return (
      <h3>No scores found.</h3>
    )
  }
  return data.map((scoreData, idx) => <Score key={idx} idx={idx} scoreData={scoreData} />);
}

export default ScoresList;
