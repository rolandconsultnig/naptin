import { Toaster } from 'react-hot-toast'
import { ChatSocketProvider } from '../chat/ChatSocketContext'
import { ChatCallProvider } from '../chat/ChatCallContext'
import { OwlChatApp } from '../chat/OwlChatApp'
import { CallUI } from '../chat/CallUI'

/** Owl Talk: messaging, calls, and presence inside the portal. */
export default function ChatPage() {
  return (
    <ChatSocketProvider>
      <ChatCallProvider>
        <div
          className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-[#e9edef]"
          style={{ height: 'calc(100vh - 7.5rem)', minHeight: 420 }}
        >
          <OwlChatApp />
        </div>
        <CallUI />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#006838',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
            },
            success: {
              style: { background: '#006838' },
              iconTheme: { primary: '#fff', secondary: '#006838' },
            },
            error: {
              style: { background: '#b91c1c' },
            },
          }}
          containerStyle={{ zIndex: 9999 }}
        />
      </ChatCallProvider>
    </ChatSocketProvider>
  )
}
