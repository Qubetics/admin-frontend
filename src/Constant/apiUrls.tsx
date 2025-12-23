export const apiUrls = {
  getAllPlan: (address: string) =>
    `/api/v1/plans?reverse=true&address=${address}`,
  postNodeRequest: "/api/v1/node",
  logout: `/api/v1/auth/logout`,
  login: `/api/v1/auth/login`,
  register: `/api/v1/auth/register`,
  nodeRequestedList: (
    page: number,
    limit: number,
    status: string,
    address: string
  ) =>
    `/api/v1/node?page=${page}&limit=${limit}&status=${status}&address=${address}`,
  nodelist: (status: any, page: number, limit: number) =>
    `/api/v1/node/prov?status=${status}&page=${page}&limit=${limit}`,
  nodeStatusAction: (nodeAddress: string, status: string) =>
    `/api/v1/node/action?address=${nodeAddress}&status=${status}`,
  nodeCount: `/api/v1/node/count`,
  nodeRequestCount: `/api/v1/node/request-count`,
  checkDisposableEmail: `/api/v1/auth/check-disposable-email`,
};
