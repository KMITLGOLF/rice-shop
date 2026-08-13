import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Admin ร้านอาหาร',
    short_name: 'Admin ร้าน',
    description: 'จัดการออเดอร์ เมนู และสถานะร้านอาหาร',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#f1f5f9',
    theme_color: '#ea580c',
  };
}
