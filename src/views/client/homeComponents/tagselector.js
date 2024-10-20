import Modal from 'react-modal';

// Inside the Sidebar component:

{/* Simple test modal */}
<Modal
  isOpen={modalOpen}
  onRequestClose={handleCloseModal}
  contentLabel="Test Modal"
>
  <h2>Modal is working!</h2>
  <button onClick={handleCloseModal}>Close</button>
</Modal>
