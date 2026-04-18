import { useState } from 'react'

/**
 * Shows profile picture when set, otherwise initials on brand background.
 */
export function UserAvatar({ user, className = 'w-8 h-8 rounded-full', textClassName = 'text-xs' }) {
  const [broken, setBroken] = useState(false)
  const src = user?.profilePicture
  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        className={`${className} object-cover border border-slate-200/80 bg-white`}
        onError={() => setBroken(true)}
      />
    )
  }
  return (
    <div
      className={`${className} bg-[#006838] flex items-center justify-center text-white font-bold ${textClassName} flex-shrink-0`}
    >
      {user?.initials || 'NP'}
    </div>
  )
}
