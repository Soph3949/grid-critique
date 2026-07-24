'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/store/useImageStore';

export default function AnalyzePage() {
  const router = useRouter();
  const { referenceImage, artworkImage } = useImageStore();

  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [artworkImageUrl, setArtworkImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cleanupRef: (() => void) | undefined;
    let cleanupArt: (() => void) | undefined;

    if (referenceImage) {
      const url = URL.createObjectURL(referenceImage);
      setReferenceImageUrl(url);
      cleanupRef = () => URL.revokeObjectURL(url);
    }
    if (artworkImage) {
      const url = URL.createObjectURL(artworkImage);
      setArtworkImageUrl(url);
      cleanupArt = () => URL.revokeObjectURL(url);
    }

    return () => {
      if (cleanupRef) cleanupRef();
      if (cleanupArt) cleanupArt();
    };
  }, [referenceImage, artworkImage]);

  if (!referenceImage || !artworkImage || !referenceImageUrl || !artworkImageUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">No Images Uploaded</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">Please upload both a reference image and an artwork image to get analysis.</p>
        <button
          onClick={() => router.push('/upload')}
          className="px-8 py-3 rounded-md text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Artwork Analysis</h1>

      {/* Top: Thumbnails */}
      <div className="flex justify-center space-x-8 mb-12">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Reference</h2>
          <img src={referenceImageUrl} alt="Reference Thumbnail" className="w-32 h-32 object-contain rounded-lg shadow-md" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Artwork</h2>
          <img src={artworkImageUrl} alt="Artwork Thumbnail" className="w-32 h-32 object-contain rounded-lg shadow-md" />
        </div>
      </div>

      {/* Middle: Overall Score Card */}
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overall Score</h2>
        <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-6">87/100</p>
        <div className="grid grid-cols-2 gap-4 text-left">
          <p className="text-lg text-gray-700 dark:text-gray-300">Proportion: <span className="font-semibold">92%</span></p>
          <p className="text-lg text-gray-700 dark:text-gray-300">Composition: <span className="font-semibold">84%</span></p>
          <p className="text-lg text-gray-700 dark:text-gray-300">Details: <span className="font-semibold">86%</span></p>
          <p className="text-lg text-gray-700 dark:text-gray-300">Color: <span className="font-semibold">90%</span></p> {/* Example additional score */}
        </div>
      </div>

      {/* Bottom: Grid Feedback Section */}
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Grid Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mock Feedback Card 1 */}
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">Square: B3</p>
            <p className="text-gray-700 dark:text-gray-300">Issue: The eye is positioned slightly too high.</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Suggestion: Move the eye downward and compare the angle.</p>
          </div>
          {/* Mock Feedback Card 2 */}
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">Square: D5</p>
            <p className="text-gray-700 dark:text-gray-300">Issue: Jaw width is narrower than the reference.</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Suggestion: Increase width in this area.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
