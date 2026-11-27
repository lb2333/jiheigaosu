'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store/platform-store';
import { DirectorySubPage } from './components/DirectorySubPage';
import { PatrolSubPage } from './components/PatrolSubPage';
import { PlaybackSubPage } from './components/PlaybackSubPage';
import { AirGroundSubPage } from './components/AirGroundSubPage';
import './m10.css';

interface VideoNavBridge {
  patrolCamId?: string;
  playbackCamId?: string;
  playbackDate?: string;
  playbackClipIdx?: number;
  playbackSecInClip?: number;
}

let pendingVideoNav: VideoNavBridge = {};

export function VideoModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  const [liveClockSec, setLiveClockSec] = useState(10 * 3600 + 45 * 60 + 12);
  const [bridge] = useState<VideoNavBridge>(() => {
    const snap = { ...pendingVideoNav };
    pendingVideoNav = {};
    return snap;
  });

  useEffect(() => {
    setCesiumMode('opaque');
  }, [subPageId, setCesiumMode]);

  // 1Hz live HUD clock shared across live surveillance views, cleaned up on unmount
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveClockSec((prev) => prev + 1);
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  function navigateTo(targetSubPage: string, opts?: VideoNavBridge) {
    if (opts) {
      pendingVideoNav = { ...opts };
    }
    router.push(`/video/${targetSubPage}`);
  }

  return (
    <section id="moduleStageHost" className="module-stage-host active mode-opaque">
      {subPageId === 'patrol' ? (
        <PatrolSubPage
          activeSectionId={activeSectionId}
          liveClockSec={liveClockSec}
          initialCamId={bridge.patrolCamId}
          onOpenDirectory={() => navigateTo('directory')}
          showToast={showToast}
        />
      ) : subPageId === 'playback' ? (
        <PlaybackSubPage
          activeSectionId={activeSectionId}
          initialCamId={bridge.playbackCamId}
          initialDate={bridge.playbackDate}
          initialClipIdx={bridge.playbackClipIdx}
          initialSecInClip={bridge.playbackSecInClip}
          onJumpSafety={() => router.push('/safety/overview')}
          showToast={showToast}
        />
      ) : subPageId === 'airground' ? (
        <AirGroundSubPage
          activeSectionId={activeSectionId}
          onOpenPlayback={(camId, date) =>
            navigateTo('playback', {
              playbackCamId: camId,
              playbackDate: date,
              playbackClipIdx: 1,
              playbackSecInClip: 752,
            })
          }
          onJumpUav={() => router.push('/uav/hazards')}
          onJumpSafety={() => router.push('/safety/overview')}
          showToast={showToast}
        />
      ) : (
        <DirectorySubPage
          activeSectionId={activeSectionId}
          liveClockSec={liveClockSec}
          onGoPatrol={(camId) => navigateTo('patrol', { patrolCamId: camId })}
          onGoPlayback={(camId) =>
            navigateTo('playback', { playbackCamId: camId })
          }
          showToast={showToast}
        />
      )}
    </section>
  );
}
