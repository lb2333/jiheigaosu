'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store/platform-store';
import { ShowcaseSubPage } from './components/ShowcaseSubPage';
import { TopicsSubPage } from './components/TopicsSubPage';
import './m12.css';

interface PinganNavBridge {
  selectedTopicId?: string;
}

let pendingNavBridge: PinganNavBridge = {};

export function PinganModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  const [bridge] = useState<PinganNavBridge>(() => {
    const snap = { ...pendingNavBridge };
    pendingNavBridge = {};
    return snap;
  });

  useEffect(() => {
    setCesiumMode('opaque');
  }, [subPageId, setCesiumMode]);

  const normalizedSubPage = subPageId === 'topics' ? 'topics' : 'showcase';

  return (
    <section id="moduleStageHost" className="module-stage-host active mode-opaque">
      {normalizedSubPage === 'topics' ? (
        <TopicsSubPage
          activeSectionId={activeSectionId}
          initialSelectedTopicId={bridge.selectedTopicId}
          showToast={showToast}
        />
      ) : (
        <ShowcaseSubPage
          activeSectionId={activeSectionId}
          onJumpTopics={(topicId) => {
            pendingNavBridge = { selectedTopicId: topicId };
            router.push('/pingan/topics');
          }}
          showToast={showToast}
        />
      )}
    </section>
  );
}
