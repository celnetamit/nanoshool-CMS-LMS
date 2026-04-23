'use client'

import { useState } from 'react'
import styles from './SupportChatbot.module.css'

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Hi there! I am the NSTC Assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')

    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "I'm a placeholder assistant right now! In Phase 5.6 this will be connected to an LLM chain equipped with NSTC knowledge."
      }])
    }, 800)
  }

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className={styles.fab}
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.window}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <span className={styles.botIcon}>🤖</span>
              <div>
                <h4>NSTC Assistant</h4>
                <p>Always online</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.messageWrap} ${m.role === 'user' ? styles.userWrap : styles.botWrap}`}>
                <div className={`${styles.bubble} ${m.role === 'user' ? styles.userBubble : styles.botBubble}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form className={styles.inputArea} onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Type your question..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.sendBtn}>↗</button>
          </form>
        </div>
      )}
    </>
  )
}
