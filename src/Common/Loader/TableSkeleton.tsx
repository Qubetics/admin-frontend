import { Skeleton } from "antd";
import "./TableSkeleton.scss";
import type { SkeletonProps } from "../../utils/Interfaces";

const TableSkeleton = ({ rows = 2, columns }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="table-skeleton-row">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <td key={colIndex}>
              <Skeleton active title={false} paragraph={{ rows: 1 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
