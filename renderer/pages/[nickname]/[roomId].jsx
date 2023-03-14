import { useRouter } from 'next/router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Box, Center, Button, Input } from '@chakra-ui/react'
import electron from 'electron'
import useMessages from '../../../lib/useMessages';

const ipcRenderer = electron.ipcRenderer || false;

export default function Room () {
    const router = useRouter()
    const { roomId, nickname } = router.query
    const messageInput = useRef(null)
    const [messages, refreshMessages, tempMessages] = useMessages()

    const createRoom = () => {
        ipcRenderer.send('createRoom', roomId, nickname)
    }

    const sendMessage = () => {
        const message = messageInput.current.value
        ipcRenderer.send('sendMessage', message)
        messageInput.current.value = ''
    }

    const addMessage = useCallback((message) => {
        console.log('add message called')
        // console.log(message, messages)
        tempMessages.current.push(message)
        refreshMessages()
    }, [])

    useEffect(() => {
        if (nickname && roomId) {
            createRoom()

            ipcRenderer.on('chat', (event, message) => {
                // console.log('message from ipc', message)
                addMessage(message)
            })
            ipcRenderer.on('join', (event, message) => {
                // console.log(message)
                addMessage(message)
            })
        }
        const listener = event => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
              event.preventDefault();
              sendMessage()
            }
          };
          messageInput.current.addEventListener("keydown", listener);
          return () => {
            messageInput.current.removeEventListener("keydown", listener);
          };
    }, [nickname, roomId])

    return (
            <>
            <Box w={'100vw'} h={'80vh'} overflow={'scroll'}>
                <p>{'Room ID: ' + roomId}</p>
                {
                    messages.map((message, index) => message.type === 'message' ? (
                        <p>{message.nickname + ': ' + message.text}</p>
                    ) : (
                        <p>{message.nickname + ' has joined the chat!'}</p>
                    ))
                }
            </Box>
            <Box w={'100vw'} h={'20vh'} bg={'gray.300'} bottom={0} left={0} >
            <Input variant={'filled'} m={4} ref={messageInput} w={'98%'}  />
            </Box>
            </>
        )
}