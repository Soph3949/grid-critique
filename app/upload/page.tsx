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
    <div
      className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: '#FAF7F2' }}
    >
      <h1 className="text-4xl font-extrabold mb-2" style={{ color: '#3D2C2C' }}>Upload Images</h1>
      <p className="mb-10 text-sm" style={{ color: '#8C7B72' }}>Upload your reference and artwork to get started with the critique.</p>
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
        className={`px-8 py-3 rounded-2xl text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
        style={
          isContinueDisabled
            ? { background: '#EDE0D4', color: '#B0A099', cursor: 'not-allowed' }
            : {
                background: 'linear-gradient(135deg, #E8A4B8 0%, #D4967A 100%)',
                color: '#fff',
                boxShadow: '0 6px 20px rgba(232, 164, 184, 0.35)',
              }
        }
      >
        Continue →
      </button>
    </div>
  );
}
