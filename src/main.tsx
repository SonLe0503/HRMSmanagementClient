import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Routers from './layouts/Routers'
import { Provider } from 'react-redux'
import { store, persistor } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import "./styles/index.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routers />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
)
