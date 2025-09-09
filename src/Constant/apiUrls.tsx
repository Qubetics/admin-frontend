export const apiUrls = {
  getAllPlan: (page: number, limit: number) =>
    `plans?page=${page}&limit=${limit}`,
  postNodeRequest: "node",
  logout: `auth/logout`,
  login: `auth/login`,
  nodeRequestedList: "node",
  nodelist: "node/prov/:address",
};
