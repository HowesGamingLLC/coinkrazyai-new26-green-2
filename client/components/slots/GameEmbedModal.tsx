import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Volume2, VolumeX, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface GameEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: number;
    name: string;
    provider: string;
    embed_url?: string;
    image_url?: string;
  };
}

export const GameEmbedModal = ({ isOpen, onClose, game }: GameEmbedModalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    toast.error('Failed to load game embed. The provider URL may be unavailable.');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    // Force reload iframe by remounting
    const iframe = document.getElementById(`game-iframe-${game.id}`) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = game.embed_url || '';
    }
  };

  const handleFullscreen = async () => {
    const element = document.getElementById(`game-embed-container-${game.id}`);
    if (element) {
      try {
        if (!document.fullscreenElement) {
          await element.requestFullscreen();
          setIsFullscreen(true);
        } else {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      } catch (error) {
        toast.error('Fullscreen not supported');
      }
    }
  };

  if (!isOpen || !game.embed_url) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-start justify-between w-full">
            <div>
              <DialogTitle>{game.name}</DialogTitle>
              <DialogDescription>{game.provider}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Control Bar */}
          <div className="flex items-center gap-2 px-6 py-3 border-b bg-muted/50">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              title="Refresh game"
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="gap-2"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              {isMuted ? 'Muted' : 'Sound'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFullscreen}
              title="Fullscreen"
              className="gap-2"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Embed Container */}
          <div
            id={`game-embed-container-${game.id}`}
            className="flex-1 overflow-hidden bg-black relative"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-4">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                  <p className="text-white text-sm">Loading game...</p>
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">⚠️</div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Unable to Load Game</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      The game embed URL is not accessible. This could be due to:
                    </p>
                    <ul className="text-gray-400 text-sm space-y-1 text-left max-w-sm">
                      <li>• The provider API is currently offline</li>
                      <li>• The embed URL needs to be configured</li>
                      <li>• Your location may have access restrictions</li>
                    </ul>
                  </div>
                  <div className="flex gap-2 justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      className="gap-2"
                    >
                      <RotateCw className="w-4 h-4" />
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <iframe
              id={`game-iframe-${game.id}`}
              src={game.embed_url}
              title={game.name}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t px-6 py-3 bg-muted/50 text-xs text-muted-foreground">
          <p>
            Playing: {game.name} by {game.provider} | Remember to set betting limits and play responsibly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameEmbedModal;
