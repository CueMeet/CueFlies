import Navbar from '../Navbar';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DefaultLayout; 