export const apiUrls = {
    getAllPlan: (page: number, limit: number) =>
      `/api/v1/plans?page=${page}&limit=${limit}`,
    postNodeRequest: "/api/v1/node",
  };
  