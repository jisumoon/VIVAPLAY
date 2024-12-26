import { atom } from "recoil";

export const islogin = atom<boolean>({
  key: "isLogin",
  default: false,
});
