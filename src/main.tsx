import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import TankGame from './TankGame'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
      <TankGame />
    </ChakraProvider>
  </StrictMode>,
)
