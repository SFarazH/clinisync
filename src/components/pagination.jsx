import { Button } from "./ui/button";

export const Pagination = ({ pagination, limit, setCurrentPage, setLimit }) => {
  if (pagination.pages === 0) return;
  return (
    <div className="flex flex-col text-sm md:flex-row justify-between items-center mt-4 gap-2">
      <div>
        Page <b>{pagination.page}</b> of <b>{pagination.pages}</b>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="limit">Rows per page:</label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded p-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
    </div>
  );
};
