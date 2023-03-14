import { Box, Center, Button, Input, HStack, VStack, Text } from '@chakra-ui/react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { getRanHex } from '../../lib/other';

export default function Home() {
  const router = useRouter()
  const roomRef = useRef(null)
  const nicknameRef = useRef(null)
  const nicknameNewRef = useRef(null)

  return (
    <Center w={'100vw'} h={'100vh'}>
      <HStack gap={16}>
        <Box>
          <Input placeholder="Enter Nickname" mb={8} ref={nicknameNewRef} />
          <Button variant={'solid'} colorScheme={'blue'} onClick={() => {
            const nickname = nicknameNewRef.current.value
            const roomId = getRanHex(64)
            router.push(`/${nickname}/${roomId}`)
          }}>Create a new Room</Button>
        </Box>
        <Box>
          <Input placeholder="Enter Room ID" mb={4} ref={roomRef} />
          <Input placeholder="Enter Nickname" mb={8} ref={nicknameRef} />
          <Button variant={'solid'} colorScheme={'blue'} onClick={() => {
            const roomId = roomRef.current.value
            const nickname = nicknameRef.current.value
            router.push(`/${nickname}/${roomId}`)
          }}>Join Room</Button>
        </Box>
      </HStack>
    </Center>
  )
}
