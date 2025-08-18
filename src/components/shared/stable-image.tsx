
"use client";

import * as React from 'react';
import Image, { type ImageProps } from 'next/image';

interface StableImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  placeholder: string;
}

export default function StableImage({ src, placeholder, ...props }: StableImageProps) {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // Reset state if the src prop changes
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleImageError = () => {
    if (!hasError) {
      setImgSrc(placeholder);
      setHasError(true);
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc || placeholder}
      onError={handleImageError}
    />
  );
}
