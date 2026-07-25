import { create } from 'zustand';

export interface AlignmentTransform {
  scale: number;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
}

interface ImageStore {
  referenceImage: File | null;
  artworkImage: File | null;
  alignmentTransform: AlignmentTransform;
  gridSize: number;
  setReferenceImage: (image: File | null) => void;
  setArtworkImage: (image: File | null) => void;
  setAlignmentTransform: (transform: AlignmentTransform) => void;
  setGridSize: (size: number) => void;
  clearImages: () => void;
}

const DEFAULT_TRANSFORM: AlignmentTransform = {
  scale: 1,
  x: 0,
  y: 0,
  rotation: 0,
  opacity: 1,
};

export const useImageStore = create<ImageStore>((set) => ({
  referenceImage: null,
  artworkImage: null,
  alignmentTransform: DEFAULT_TRANSFORM,
  gridSize: 8,
  setReferenceImage: (image) => set({ referenceImage: image }),
  setArtworkImage: (image) => set({ artworkImage: image }),
  setAlignmentTransform: (transform) => set({ alignmentTransform: transform }),
  setGridSize: (size) => set({ gridSize: size }),
  clearImages: () => set({ referenceImage: null, artworkImage: null, alignmentTransform: DEFAULT_TRANSFORM, gridSize: 8 }),
}));
