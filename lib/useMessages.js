import { useState, useRef, useCallback } from 'react'

export default function useMessages() {
    const [messages, setMessages] = useState([])
    const tempMessages = useRef([])

    const refreshMessages = useCallback(() => {
        const newMessages = [...tempMessages.current]
        setMessages(newMessages)
    }, [])

    return [messages, refreshMessages, tempMessages]
}