import Score from "./Score";
import styles from './ScoresList.module.css';

export default function ScoresList({data}) {
  return data.map((scoreData, idx) => <Score key={idx} idx={idx} scoreData={scoreData} />);
}
