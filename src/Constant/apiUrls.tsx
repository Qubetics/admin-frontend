export const apiUrls = {
  getAllPlan: (page: number, limit: number) =>
    `plans?page=${page}&limit=${limit}`,
  postNodeRequest: "node",
  logout: `auth/logout`,
  login: `auth/login`,
  nodeRequestedList:(page:number,limit:number) => `node?page=${page}&limit=${limit}`,
  nodelist: "node/prov/:address",
  nodeStatusAction:(nodeAddress:string,status:string)=> `node/action?address=${nodeAddress}&status=${status}`
};
