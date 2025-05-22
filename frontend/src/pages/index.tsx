import DefaultLayout from '../components/layouts';
import Image from 'next/image';
import { features, steps } from '../components/lib';
import { useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  const handleSignInWithGoogle = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL as string;
    window.location.href = url;
  }, []);

  return (
    <DefaultLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-20 text-center">
            <main className="mt-10 mx-auto max-w-4xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20">
              <div>
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block mb-2">Never Miss a</span>
                  <span className="block text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                    Meeting Detail Again.
                  </span>
                </h1>
                <p className="mt-6 text-base text-gray-500 sm:text-lg max-w-2xl mx-auto">
                  CueFlies automatically joins your meetings, records conversations, and generates detailed notes and insights.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="px-6 py-2 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors duration-200 shadow-lg hover:shadow-primary/30 md:py-3 md:text-base md:px-8"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <button
                      onClick={handleSignInWithGoogle}
                      className="px-6 py-2 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors duration-200 shadow-lg hover:shadow-primary/30 md:py-3 md:text-base md:px-8 flex items-center gap-3"
                    >
                      Sign in with Google
                      <span className="bg-white/80 rounded-[10px] p-1">
                        <Image src="/svgs/google.svg" alt="Google" width={18} height={18} />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-4 text-3xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for better meetings
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-12 max-w-5xl mx-auto">
              {features.map((feature) => (
                <div key={feature.name} className="relative bg-white p-6 rounded-2xl border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="ml-6 text-lg font-bold text-gray-900">{feature.name}</h3>
                  </div>
                  <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm text-primary font-semibold tracking-wide uppercase">How it works</h2>
            <p className="mt-4 text-3xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple and Automated
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-x-8">
              {steps.map((step) => (
                <div key={step.number} className="relative bg-white p-8 rounded-2xl border border-gray-200 ">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white text-xl font-bold">
                      {step.number}
                    </div>
                    <h3 className="ml-6 text-lg font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-base text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default HomePage;
