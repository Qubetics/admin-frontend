"use client";
import { Skeleton } from "antd";
import "./TableSkeleton.scss";

interface Props {
  rows?: number;
  columns: number;
}

const TableSkeleton = ({ rows = 2, columns }: Props) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="table-skeleton-row">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <td key={colIndex}>
              <Skeleton
                active
                title={false}
                paragraph={{ rows: 1 }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
