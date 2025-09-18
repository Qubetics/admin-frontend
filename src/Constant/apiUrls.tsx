export const apiUrls = {
  getAllPlan: (page: number, limit: number) =>
    `/api/v1/plans?page=${page}&limit=${limit}&reverse=true`,
  postNodeRequest: "/api/v1/node",
  logout: `/api/v1/auth/logout`,
  login: `/api/v1/auth/login`,
  nodeRequestedList:(page:number,limit:number,status:string) => `/api/v1/node?page=${page}&limit=${limit}&status=${status}`,
  nodelist:(address:any,status:any,page:number,limit:number)=> `/api/v1/node/prov?address=${address}&status=${status}&page=${page}&limit=${limit}`,
  nodeStatusAction:(nodeAddress:string,status:string)=> `/api/v1/node/action?address=${nodeAddress}&status=${status}`,
  nodeCount:(address:any) => `/api/v1/node/count?address=${address}`,
  nodeRequestCount:(address:any) => `/api/v1/node/request-count?address=${address}`,
};
