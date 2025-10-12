import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Archive as ArchiveIcon } from "lucide-react";
import { StoryViewer } from "../components/StoryViewer";
import { mockArchivedStories, ArchivedStoryGroup } from "../__mocks__/archivedStories";
import { cn } from "@/lib/utils";
import type { Story } from "../types";

export const ArchivePage = () => {
  const navigate = useNavigate();
  const [openViewer, setOpenViewer] = useState(false);
  const [viewerData, setViewerData] = useState<{
    stories: Story[];
    index: number;
  }>({ stories: [], index: 0 });

  const handleOpenArchive = (archive: ArchivedStoryGroup) => {
    setViewerData({ stories: archive.stories, index: 0 });
    setOpenViewer(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-accent rounded-full transition-colors"
                aria-label="Quay lại"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Kho lưu trữ</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-6">
            <button
              className={cn(
                "py-3 px-1 text-sm font-medium border-b-2 border-primary transition-colors",
                "flex items-center gap-2"
              )}
            >
              <ArchiveIcon className="w-3 h-3" />
              <span>Tin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Tin đã lưu trữ chỉ hiển thị với mình bạn, trừ khi bạn chọn chia sẻ.
          </p>
        </div>

        {/* Archive Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2">
          {mockArchivedStories.map((archive) => (
            <button
              key={archive.id}
              onClick={() => handleOpenArchive(archive)}
              className="relative aspect-[9/16] group cursor-pointer overflow-hidden rounded-sm hover:opacity-90 transition-opacity"
            >
              {/* Thumbnail */}
              <img
                src={archive.thumbnail}
                alt={`Archive from ${archive.date}`}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Date Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-white text-left">
                <div className="text-lg font-bold leading-none">{archive.day}</div>
                <div className="text-[10px] leading-none mt-0.5">{archive.month}</div>
                {archive.year && (
                  <div className="text-[10px] leading-none opacity-80">
                    {archive.year}
                  </div>
                )}
              </div>

              {/* Highlight Indicator */}
              {archive.isInHighlight && (
                <div className="absolute top-2 right-2">
                  <div className="bg-black/60 rounded-full p-1">
                    <svg
                      aria-label="Tin tồn tại ở phần nổi bật"
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3.915 5.31q.337-.407.713-.779m-3.121 7.855Q1.5 12.194 1.5 12a10.505 10.505 0 0 1 .516-3.265m3.243 11.338a10.55 10.55 0 0 1-2.89-3.864m14.482 5.108a10.547 10.547 0 0 1-8.163.65M12.002 1.5a10.504 10.504 0 0 1 7.925 17.39"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M12.002 9.201c-.005.003-.006.001-.008 0a2.555 2.555 0 0 0-2.201-1.157A2.92 2.92 0 0 0 7 11.072c0 1.528 1.122 2.504 2.207 3.447q.198.171.396.346l.473.424c.918.821 1.369 1.223 1.584 1.362a.628.628 0 0 0 .68 0c.205-.133.58-.465 1.633-1.406l.424-.38c.137-.122.275-.24.412-.36 1.077-.935 2.191-1.9 2.191-3.433a2.92 2.92 0 0 0-2.793-3.028 2.544 2.544 0 0 0-2.205 1.157Z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {mockArchivedStories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ArchiveIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chưa có tin nào</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Tin bạn lưu trữ sẽ xuất hiện ở đây
            </p>
          </div>
        )}
      </div>

      {/* Story Viewer */}
      {openViewer && (
        <StoryViewer
          isOpen={openViewer}
          onClose={() => setOpenViewer(false)}
          stories={viewerData.stories}
          initialStoryIndex={viewerData.index}
        />
      )}
    </div>
  );
};

