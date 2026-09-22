import { useRef, useState } from 'react';
import Modal from './playground/Modal';
import Tabs, { type TabItem } from './playground/Tabs';
import Disclosure from './playground/Disclosure';
import './App.css';

const tabItems: TabItem[] = [
  { id: 'profile', label: 'Profile', content: <p>Profile settings go here.</p> },
  { id: 'account', label: 'Account', content: <p>Account settings go here.</p> },
  { id: 'billing', label: 'Billing', content: <p>Billing details go here.</p> },
];

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="app">
      <h1>Accessible Components Playground</h1>
      <p className="app__intro">
        Hand-built modal, tabs, and disclosure — implemented against the W3C ARIA
        Authoring Practices patterns. Try each one using only your keyboard.
      </p>

      <section>
        <h2>Modal Dialog</h2>
        <button ref={modalTriggerRef} type="button" onClick={() => setIsModalOpen(true)}>
          Open modal
        </button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          titleId="demo-modal-title"
          title="Example Modal"
          triggerRef={modalTriggerRef}
        >
          <p>This is a modal dialog. Try pressing Tab — focus should stay trapped in here.</p>
          <input type="text" placeholder="A focusable input inside the modal" />
          <button type="button">Another focusable button</button>
          <p>Press Escape to close.</p>
        </Modal>
      </section>

      <section>
        <h2>Tabs</h2>
        <Tabs tabs={tabItems} />
      </section>

      <section>
        <h2>Disclosure</h2>
        <Disclosure id="faq-1" summary="What is a disclosure widget?">
          <p>
            A disclosure is a button that shows or hides a section of content, like an FAQ
            answer. It uses aria-expanded and aria-controls to communicate its state.
          </p>
        </Disclosure>
      </section>
    </div>
  );
}

export default App;
