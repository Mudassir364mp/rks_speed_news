'use client';
import { useEffect } from 'react';

export default function AdSense() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-7971563579834453"
      data-ad-slot="4968983158"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
