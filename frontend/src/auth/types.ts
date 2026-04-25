export type CurrentUser = {
  userId: number;
  email: string;
  fullName: string;
  phone: string;
  department: string;
  profileImageUrl: string;
  roles: string[];
};

export type OauthLoginInfo = {
  googleAuthorizationUrl: string;
};
