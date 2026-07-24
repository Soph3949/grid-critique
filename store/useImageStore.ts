import { create } from 'zustand';

interface ImageStore {
  referenceImage: File | null;
  artworkImage: File | null;
  setReferenceImage: (image: File | null) => void;
  setArtworkImage: (image: File | null) => void;
  clearImages: () => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  referenceImage: null,
  artworkImage: null,
  setReferenceImage: (image) => set({ referenceImage: image }),
  setArtworkImage: (image) => set({ artworkImage: image }),
  clearImages: () => set({ referenceImage: null, artworkImage: null }),
}));
