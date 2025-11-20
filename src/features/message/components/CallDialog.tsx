import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'voice' | 'video';
  isIncoming?: boolean;
  contact: {
    name: string;
    avatar: string;
    username: string;
  };
  onAccept?: () => void;
  onDecline?: () => void;
}

export const CallDialog: React.FC<CallDialogProps> = ({
  open,
  onOpenChange,
  type,
  isIncoming = false,
  contact,
  onAccept,
  onDecline,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(type === 'video');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    setCallStatus('connected');
    onAccept?.();
  };

  const handleDecline = () => {
    setCallStatus('ended');
    onDecline?.();
    setTimeout(() => onOpenChange(false), 1000);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => onOpenChange(false), 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 bg-gradient-to-b from-background to-muted">
        <div className="p-8 text-center">
          {}
          <div className="mb-8">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback className="text-2xl">{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{contact.name}</h2>
            <p className="text-muted-foreground">@{contact.username}</p>
          </div>

          {}
          <div className="mb-8">
            {callStatus === 'ringing' && (
              <p className="text-lg">
                {isIncoming ? 'Incoming call...' : 'Calling...'}
              </p>
            )}
            {callStatus === 'connected' && (
              <p className="text-lg font-mono">{formatDuration(duration)}</p>
            )}
            {callStatus === 'ended' && (
              <p className="text-lg text-muted-foreground">Call ended</p>
            )}
          </div>

          {}
          <div className="flex justify-center space-x-4">
            {callStatus === 'ringing' && isIncoming && (
              <>
                <Button
                  onClick={handleDecline}
                  size="lg"
                  variant="destructive"
                  className="rounded-full h-14 w-14 p-0"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button
                  onClick={handleAccept}
                  size="lg"
                  className="rounded-full h-14 w-14 p-0 bg-success hover:bg-success/90"
                >
                  <Phone className="h-6 w-6" />
                </Button>
              </>
            )}

            {callStatus === 'ringing' && !isIncoming && (
              <Button
                onClick={handleDecline}
                size="lg"
                variant="destructive"
                className="rounded-full h-14 w-14 p-0"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            )}

            {callStatus === 'connected' && (
              <>
                {}
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  size="lg"
                  variant={isMuted ? "destructive" : "secondary"}
                  className="rounded-full h-12 w-12 p-0"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                {}
                {type === 'video' && (
                  <Button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    size="lg"
                    variant={!isVideoOn ? "destructive" : "secondary"}
                    className="rounded-full h-12 w-12 p-0"
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                )}

                {}
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full h-12 w-12 p-0"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>

                {}
                <Button
                  onClick={handleEndCall}
                  size="lg"
                  variant="destructive"
                  className="rounded-full h-12 w-12 p-0"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {}
          <div className="mt-6">
            <div className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-sm',
              type === 'video' ? 'bg-primary/10 text-primary' : 'bg-secondary'
            )}>
              {type === 'video' ? (
                <Video className="h-4 w-4 mr-2" />
              ) : (
                <Phone className="h-4 w-4 mr-2" />
              )}
              {type === 'video' ? 'Video Call' : 'Voice Call'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};