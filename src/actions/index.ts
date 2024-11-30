import { authorize, logout } from "./auth";
import { labelPost } from "./labelPost";

export const server = {
  labelPost,
  authorize,
  logout,
};
