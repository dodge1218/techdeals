'use client';

import { formatDuration, formatViewCount } from '@/lib/adapters/youtube';

interface VideoEmbedProps {
  video: {
    id: string;
    title: string;
    embedUrl: string | null;
    thumbnailUrl: string | null;
    channelName: string | null;
    viewCount: number | null;
    duration: number | null;
  };
}

export function VideoEmbed({ video }: VideoEmbedProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      <div className="relative aspect-video bg-gray-900">
        {video.embedUrl ? (
          <iframe
            src={video.embedUrl}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img
            src={video.thumbnailUrl || '/placeholder.jpg'}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(`PT${video.duration}S`)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2">{video.title}</h3>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{video.channelName}</span>
          {video.viewCount !== null && (
            <span>{formatViewCount(video.viewCount)} views</span>
          )}
        </div>
      </div>
    </div>
  );
}
