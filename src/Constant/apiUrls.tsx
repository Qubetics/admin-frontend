export const apiUrls = {
  getAllPlan: (page: number, limit: number) =>
    `/api/v1/plans?page=${page}&limit=${limit}`,
  postNodeRequest: "/api/v1/node",
  logout: `/api/v1/auth/logout`,
  login: `/api/v1/auth/login`,
  nodeRequestedList:(page:number,limit:number) => `/api/v1/node?page=${page}&limit=${limit}`,
  nodelist:(address:any)=> `/api/v1/node/prov?address=${address}`,
  nodeStatusAction:(nodeAddress:string,status:string)=> `/api/v1/node/action?address=${nodeAddress}&status=${status}`
};
