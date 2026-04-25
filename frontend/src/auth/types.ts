export type CurrentUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  profileImageUrl?: string | null;
  roles: string[];
};

export type OauthLoginInfo = {
  googleAuthorizationUrl: string;
};

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
};
