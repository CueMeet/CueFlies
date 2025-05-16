import DefaultLayout from '../../components/layouts';
import { useMutation } from '@apollo/client';
import { LOGIN_WITH_GOOGLE } from '../../graphql/Auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { UrlSlugType } from '../../utils/enum';
import { useAuthStore } from '@/store/authStore';

const GoogleCallbackPage = () => {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);

  useEffect(() => {
    const handleLoginWithGoogle = async () => {
      // Get code from URL query parameters
      const { code } = router.query;

      console.log(code);

      if (code) {
        try {
          const response = await loginWithGoogle({
            variables: {
              token: code
            }
          });

          if (response.data?.loginWithGoogle?.accessToken) {
            setUser(response.data.loginWithGoogle?.user)
            setToken(response.data.loginWithGoogle?.accessToken)
            router.replace(UrlSlugType.DASHBOARD);
          }
        } catch (error: unknown) {
          router.replace(UrlSlugType.HOME);
          console.error('Google Auth error:', error);
        }
      } else {
        router.replace(UrlSlugType.HOME);
      }
    };

    if (router.isReady) {
      handleLoginWithGoogle();
    }
  }, [router, loginWithGoogle]);

  return (
    <DefaultLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Processing Google Sign In...</h2>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default GoogleCallbackPage;