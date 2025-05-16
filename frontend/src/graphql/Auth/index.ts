import { gql } from "@apollo/client";

export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($token: String!) {
    loginWithGoogle(token: $token) {
      accessToken
      user {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation refreshToken {
    refreshToken {
      accessToken
    }
  }
`;

export const LOGOUT = gql`
  mutation logout {
    logout
  }
`;