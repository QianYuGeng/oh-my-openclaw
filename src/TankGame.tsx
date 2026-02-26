import { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Text, VStack, HStack, Button, useToast } from '@chakra-ui/react'

interface Position {
  x: number
  y: number
}

interface Bullet {
  id: number
  x: number
  y: number
  direction: 'up' | 'down' | 'left' | 'right'
  isEnemy: boolean
}

const GAME_WIDTH = 600
const GAME_HEIGHT = 400
const TANK_SIZE = 40
const BULLET_SIZE = 8
const TANK_SPEED = 5
const BULLET_SPEED = 8
const ENEMY_MOVE_INTERVAL = 1000
const ENEMY_SHOOT_INTERVAL = 2000

export default function TankGame() {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 50, y: GAME_HEIGHT - 80 })
  const [playerDirection, setPlayerDirection] = useState<'up' | 'down' | 'left' | 'right'>('up')
  const [enemyPos, setEnemyPos] = useState<Position>({ x: GAME_WIDTH - 90, y: 50 })
  const [enemyDirection, setEnemyDirection] = useState<'up' | 'down' | 'left' | 'right'>('down')
  const [bullets, setBullets] = useState<Bullet[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  const bulletIdRef = useRef(0)
  const keysPressed = useRef<Set<string>>(new Set())
  const toast = useToast()

  const movePlayer = useCallback(() => {
    if (gameOver || isPaused) return
    
    setPlayerPos(prev => {
      let newX = prev.x
      let newY = prev.y
      let newDir = playerDirection

      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w') || keysPressed.current.has('W')) {
        newY = Math.max(0, prev.y - TANK_SPEED)
        newDir = 'up'
      }
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s') || keysPressed.current.has('S')) {
        newY = Math.min(GAME_HEIGHT - TANK_SIZE, prev.y + TANK_SPEED)
        newDir = 'down'
      }
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A')) {
        newX = Math.max(0, prev.x - TANK_SPEED)
        newDir = 'left'
      }
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D')) {
        newX = Math.min(GAME_WIDTH - TANK_SIZE, prev.x + TANK_SPEED)
        newDir = 'right'
      }

      if (newDir !== playerDirection) {
        setPlayerDirection(newDir)
      }

      return { x: newX, y: newY }
    })
  }, [gameOver, isPaused, playerDirection])

  const shootBullet = useCallback((isEnemy: boolean) => {
    if (gameOver || isPaused) return
    
    const pos = isEnemy ? enemyPos : playerPos
    const direction = isEnemy ? enemyDirection : playerDirection
    
    const newBullet: Bullet = {
      id: bulletIdRef.current++,
      x: pos.x + TANK_SIZE / 2 - BULLET_SIZE / 2,
      y: pos.y + TANK_SIZE / 2 - BULLET_SIZE / 2,
      direction,
      isEnemy
    }
    
    setBullets(prev => [...prev, newBullet])
  }, [gameOver, isPaused, enemyPos, enemyDirection, playerPos, playerDirection])

  const moveBullets = useCallback(() => {
    setBullets(prev => {
      return prev
        .map(bullet => {
          let newX = bullet.x
          let newY = bullet.y
          
          switch (bullet.direction) {
            case 'up': newY -= BULLET_SPEED; break
            case 'down': newY += BULLET_SPEED; break
            case 'left': newX -= BULLET_SPEED; break
            case 'right': newX += BULLET_SPEED; break
          }
          
          return { ...bullet, x: newX, y: newY }
        })
        .filter(bullet => 
          bullet.x >= -BULLET_SIZE && 
          bullet.x <= GAME_WIDTH && 
          bullet.y >= -BULLET_SIZE && 
          bullet.y <= GAME_HEIGHT
        )
    })
  }, [])

  const moveEnemy = useCallback(() => {
    if (gameOver || isPaused) return
    
    const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right']
    const randomDir = directions[Math.floor(Math.random() * directions.length)]
    setEnemyDirection(randomDir)
    
    setEnemyPos(prev => {
      let newX = prev.x
      let newY = prev.y
      
      switch (randomDir) {
        case 'up': newY = Math.max(0, prev.y - TANK_SPEED * 1.5); break
        case 'down': newY = Math.min(GAME_HEIGHT - TANK_SIZE, prev.y + TANK_SPEED * 1.5); break
        case 'left': newX = Math.max(0, prev.x - TANK_SPEED * 1.5); break
        case 'right': newX = Math.min(GAME_WIDTH - TANK_SIZE, prev.x + TANK_SPEED * 1.5); break
      }
      
      return { x: newX, y: newY }
    })
  }, [gameOver, isPaused])

  const checkCollisions = useCallback(() => {
    setBullets(prevBullets => {
      let newBullets = [...prevBullets]
      let playerHit = false
      let enemyHit = false
      
      newBullets = newBullets.filter(bullet => {
        if (bullet.isEnemy) {
          if (
            bullet.x < playerPos.x + TANK_SIZE &&
            bullet.x + BULLET_SIZE > playerPos.x &&
            bullet.y < playerPos.y + TANK_SIZE &&
            bullet.y + BULLET_SIZE > playerPos.y
          ) {
            playerHit = true
            return false
          }
        } else {
          if (
            bullet.x < enemyPos.x + TANK_SIZE &&
            bullet.x + BULLET_SIZE > enemyPos.x &&
            bullet.y < enemyPos.y + TANK_SIZE &&
            bullet.y + BULLET_SIZE > enemyPos.y
          ) {
            enemyHit = true
            return false
          }
        }
        return true
      })
      
      if (playerHit) {
        setLives(prev => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameOver(true)
          }
          return newLives
        })
      }
      
      if (enemyHit) {
        setScore(prev => prev + 100)
        toast({
          title: 'Enemy Hit!',
          description: '+100 points',
          status: 'success',
          duration: 500,
          isClosable: true,
        })
      }
      
      return newBullets
    })
  }, [playerPos, enemyPos, toast])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key)
      
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault()
        shootBullet(false)
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [shootBullet])

  useEffect(() => {
    const gameLoop = setInterval(() => {
      movePlayer()
      moveBullets()
      checkCollisions()
    }, 16)
    
    return () => clearInterval(gameLoop)
  }, [movePlayer, moveBullets, checkCollisions])

  useEffect(() => {
    const enemyMoveInterval = setInterval(moveEnemy, ENEMY_MOVE_INTERVAL)
    return () => clearInterval(enemyMoveInterval)
  }, [moveEnemy])

  useEffect(() => {
    const enemyShootInterval = setInterval(() => shootBullet(true), ENEMY_SHOOT_INTERVAL)
    return () => clearInterval(enemyShootInterval)
  }, [shootBullet])

  const restartGame = () => {
    setPlayerPos({ x: 50, y: GAME_HEIGHT - 80 })
    setPlayerDirection('up')
    setEnemyPos({ x: GAME_WIDTH - 90, y: 50 })
    setEnemyDirection('down')
    setBullets([])
    setScore(0)
    setLives(3)
    setGameOver(false)
    setIsPaused(false)
    bulletIdRef.current = 0
  }

  const getTankRotation = (direction: 'up' | 'down' | 'left' | 'right') => {
    switch (direction) {
      case 'up': return '0deg'
      case 'down': return '180deg'
      case 'left': return '-90deg'
      case 'right': return '90deg'
    }
  }

  const renderTank = (pos: Position, direction: 'up' | 'down' | 'left' | 'right', isPlayer: boolean) => {
    const color = isPlayer ? '#4CAF50' : '#f44336'
    const borderColor = isPlayer ? '#2E7D32' : '#C62828'
    
    return (
      <Box
        position="absolute"
        left={`${pos.x}px`}
        top={`${pos.y}px`}
        width={`${TANK_SIZE}px`}
        height={`${TANK_SIZE}px`}
        transition="transform 0.1s"
        transform={`rotate(${getTankRotation(direction)})`}
      >
        <Box
          width="100%"
          height="100%"
          bg={color}
          borderRadius="4px"
          border={`3px solid ${borderColor}`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 4px 8px rgba(0,0,0,0.3)"
        >
          <Box
            width="8px"
            height="20px"
            bg={borderColor}
            borderRadius="2px"
            position="absolute"
            top="-4px"
          />
        </Box>
      </Box>
    )
  }

  const renderBullet = (bullet: Bullet) => {
    return (
      <Box
        key={bullet.id}
        position="absolute"
        left={`${bullet.x}px`}
        top={`${bullet.y}px`}
        width={`${BULLET_SIZE}px`}
        height={`${BULLET_SIZE}px`}
        bg={bullet.isEnemy ? '#FF9800' : '#8BC34A'}
        borderRadius="50%"
        boxShadow={bullet.isEnemy ? '0 0 6px #FF9800' : '0 0 6px #8BC34A'}
      />
    )
  }

  return (
    <VStack spacing={4} p={4} bg="gray.900" minH="100vh" align="center" justify="center">
      <Text fontSize="3xl" fontWeight="bold" color="white">
        Tank Battle
      </Text>
      
      <HStack spacing={8}>
        <Box bg="gray.800" px={4} py={2} borderRadius="md">
          <Text color="green.400" fontWeight="bold">Score: {score}</Text>
        </Box>
        <Box bg="gray.800" px={4} py={2} borderRadius="md">
          <HStack spacing={2}>
            <Text color="red.400" fontWeight="bold">Lives:</Text>
            <HStack spacing={1}>
              {Array.from({ length: lives }).map((_, i) => (
                <Box key={i} width="20px" height="20px" bg="red.500" borderRadius="sm" />
              ))}
            </HStack>
          </HStack>
        </Box>
      </HStack>
      
      <Box
        position="relative"
        width={`${GAME_WIDTH}px`}
        height={`${GAME_HEIGHT}px`}
        bg="#1a1a2e"
        borderRadius="md"
        overflow="hidden"
        border="4px solid #16213e"
        boxShadow="0 0 20px rgba(0,0,0,0.5)"
      >
        <Box
          position="absolute"
          inset={0}
          opacity={0.1}
          backgroundImage="linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)"
          backgroundSize="40px 40px"
        />
        
        {!gameOver && renderTank(playerPos, playerDirection, true)}
        {!gameOver && renderTank(enemyPos, enemyDirection, false)}
        
        {bullets.map(renderBullet)}
        
        {gameOver && (
          <Box
            position="absolute"
            inset={0}
            bg="blackAlpha.800"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Text fontSize="4xl" fontWeight="bold" color="red.500" mb={4}>
              Game Over!
            </Text>
            <Text fontSize="xl" color="white" mb={6}>
              Final Score: {score}
            </Text>
            <Button
              size="lg"
              colorScheme="green"
              onClick={restartGame}
              _hover={{ transform: 'scale(1.05)' }}
            >
              Play Again
            </Button>
          </Box>
        )}
      </Box>
      
      <HStack spacing={4} color="gray.400" fontSize="sm">
        <Text>WASD / Arrow Keys to Move</Text>
        <Text>Space to Shoot</Text>
      </HStack>
    </VStack>
  )
}
