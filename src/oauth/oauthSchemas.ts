export type GoogleUserProfile = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
};

export type FacebookUserProfile = {
  id: string;
  email: string;
  name: string;
};
