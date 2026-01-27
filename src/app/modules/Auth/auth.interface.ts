export type TLoginUser = {
  email: string;
  password: string;
};

export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  token: string;
  newPassword: string;
}
