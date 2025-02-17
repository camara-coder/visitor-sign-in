import { useSearchParams } from 'next/navigation';
import { ConfirmationMessage } from '../../components/ConfirmationMessage';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ConfirmationMessage status={status} message={message} />
          
          <div className="mt-6 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              {/* Facebook Icon */}
            </a>
            {/* Similar links for YouTube and Instagram */}
          </div>
        </div>
      </div>
    </div>
  );
}