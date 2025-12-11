import React, { useContext } from 'react';
import { ProjectContext } from './context/ProjectContext';
import Launcher from './components/Launcher';
import StudioLayout from './components/Studio/StudioLayout';

function App() {
  const { currentProject } = useContext(ProjectContext);

  return (
    <>
      {!currentProject ? <Launcher /> : <StudioLayout />}
    </>
  );
}

export default App;
