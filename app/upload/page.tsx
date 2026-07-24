'use client';

import { useImageStore } from '@/store/useImageStore';
import UploadCard from '@/components/UploadCard';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const { referenceImage, artworkImage, setReferenceImage, setArtworkImage } = useImageStore();
  const router = useRouter();

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxImageSizeMB = 10;

  const handleContinue = () => {
    router.push('/align');
  };

  const isContinueDisabled = !referenceImage || !artworkImage;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Upload Images</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
        <UploadCard
          title="Reference Image"
          onFileUpload={setReferenceImage}
          allowedTypes={allowedImageTypes}
          maxSizeMB={maxImageSizeMB}
        />

        <UploadCard
          title="Artwork Image"
          onFileUpload={setArtworkImage}
          allowedTypes={allowedImageTypes}
          maxSizeMB={maxImageSizeMB}
        />
      </div>

      <button
        onClick={handleContinue}
        disabled={isContinueDisabled}
        className={`px-8 py-3 rounded-md text-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${isContinueDisabled
            ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'}`}
      >
        Continue
      </button>
    </div>
  );
}
