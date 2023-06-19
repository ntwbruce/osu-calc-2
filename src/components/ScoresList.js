import SortableTable from "./SortableTable";
import styles from "./ScoresList.module.css";

export default function ScoresList({ data }) {
  return <SortableTable data={data} />;
}
