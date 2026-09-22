import { useRef, useState, type KeyboardEvent } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
}

export default function Tabs({ tabs, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function activateByIndex(index: number) {
    const tab = tabs[index];
    if (!tab) return;
    setActiveId(tab.id);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = Number(e.currentTarget.dataset.index);

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        activateByIndex((currentIndex + 1) % tabs.length);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        activateByIndex((currentIndex - 1 + tabs.length) % tabs.length);
        break;
      case 'Home':
        e.preventDefault();
        activateByIndex(0);
        break;
      case 'End':
        e.preventDefault();
        activateByIndex(tabs.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div className="tabs">
      <div role="tablist" aria-label="Example tabs" className="tabs__list">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              data-index={index}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`tabs__tab ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={handleKeyDown}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== activeId}
          tabIndex={0}
          className="tabs__panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}