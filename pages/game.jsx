// pages/game.jsx
import React, { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'

const lyricRounds = [
  { lyric: "I'm diamond, you know I glow up", answer: 'Dynamite' },
  { lyric: 'You make me a believer',      answer: 'Butter'   },
  { lyric: "Cause I, I, I'm in the stars tonight", answer: 'Dynamite' }
]

const quizQuestions = [
  { q: 'Leader of BTS:',           choices: ['Jin','RM','Jimin','Suga'],         answer: 'RM' },
  { q: 'Debut Year:',              choices: ['2012','2013','2014','2015'],     answer: '2013' },
  { q: '“Butter” featured singer:',choices: ['Ed Sheeran','Charlie Puth','Selena Gomez','Halsey'], answer: 'Charlie Puth' },
  { q: 'Map of the Soul symbol:',  choices: ['Mask','Flower','Mirror','Compass'], answer: 'Mask' },
  { q: 'Golden Maknae:',           choices: ['V','Jungkook','J-Hope','Jin'],    answer: 'Jungkook' }
]

export default function Game() {
  const canvasRef = useRef(null)

  // stages: 0=start,1=act1,2=act2,3=act3,4=act4,5=act5
  const [stage, setStage]         = useState(0)
  const [lyricIdx, setLyricIdx]   = useState(0)
  const [input, setInput]         = useState('')
  const [quizIdx, setQuizIdx]     = useState(0)
  const [playlist3, setPlaylist3] = useState(false)
  const [playlist4, setPlaylist4] = useState(false)
  const [showPart2, setShowPart2] = useState(false)

  // Audio
  const missionSnd     = useRef(new Howl({ src: ['/assets/mission.mp3'], volume: 0.8 }))
  const jkSnd          = useRef(new Howl({ src: ['/assets/jungkook.wav'], volume: 0.8 }))
  const mergedBirthday = useRef(new Howl({ src: ['/assets/birthday_message.mp3'], volume: 0.8 }))

  // Draw Acts 1 & 2
  useEffect(() => {
    if (stage < 3 && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx    = canvas.getContext('2d')
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight

      const bg = new Image()
      bg.src = stage === 1 ? '/assets/temple.png' : '/assets/bts.png'
      bg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

        const drawText = (txt, y, size = 36, color = 'white') => {
          
          ctx.fillStyle = color
          ctx.font      = `${size}px Arial`
          ctx.textAlign = 'center'
          ctx.fillText(txt, canvas.width/2, y)
        }
        const drawButton = (label, x, y, w, h) => {
          ctx.fillStyle = 'rgba(255,255,255,0.9)'
          ctx.fillRect(x, y, w, h)
          ctx.fillStyle = 'black'
          ctx.font      = 'bold 24px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(label, x + w/2, y + h/2 + 8)
        }

        if (stage === 1) {
          drawText('Divya, Click YES to accept', 120)
          drawButton('YES', canvas.width/2 - 75, canvas.height/2 - 25, 150, 50)
        } else if (stage === 2) {
          drawText('🎂 Happy Birthday, Divya! 🎂', 100, 32, '#FFD700')
          drawText('Ready to help your partner Jungkook?', 160)
          drawButton('Ready?', canvas.width/2 - 100, canvas.height/2 - 25, 200, 50)
        }
      }
    }
    if (stage === 5) mergedBirthday.current.play()
  }, [stage])

  // Click/tap only for Acts 1 & 2
  useEffect(() => {
    if (stage < 1) return

    const handler = e => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top

      // Act 1 “YES”
      if (stage === 1 &&
          x >= canvas.width/2 - 75 && x <= canvas.width/2 + 75 &&
          y >= canvas.height/2 - 25 && y <= canvas.height/2 + 25
      ) {
        jkSnd.current.play()
        setStage(2)
      }

      // Act 2 “Ready?”
      if (stage === 2 &&
          x >= canvas.width/2 - 100 && x <= canvas.width/2 + 100 &&
          y >= canvas.height/2 - 25 && y <= canvas.height/2 + 25
      ) {
        setStage(3)
      }
    }

    window.addEventListener('click', handler)
    window.addEventListener('touchstart', handler)
    return () => {
      window.removeEventListener('click', handler)
      window.removeEventListener('touchstart', handler)
    }
  }, [stage])

  // Helpers
  const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '')

  // Act 3 lyric submit
  const handleLyricSubmit = () => {
    const guess   = input.trim()
    const correct = lyricRounds[lyricIdx].answer
    if (normalize(guess) === normalize(correct)) {
      if (lyricIdx + 1 < lyricRounds.length) {
        setLyricIdx(i => i + 1)
        setInput('')
      } else {
        setPlaylist3(true)
      }
    } else {
      alert('❌ Try again!')
    }
  }

  // Act 4 quiz submit
  const handleQuizChoice = choice => {
    if (choice === quizQuestions[quizIdx].answer) {
      if (quizIdx + 1 < quizQuestions.length) {
        setQuizIdx(i => i + 1)
      } else {
        setPlaylist4(true)
      }
    } else {
      alert('❌ Wrong—try again!')
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden text-white">
      {/* Stage 0: Start */}
      {stage === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <button
            onClick={() => { missionSnd.current.play(); setStage(1) }}
            className="px-6 py-3 bg-pink-500 rounded text-xl"
          >
            Tap to Start Your Adventure
          </button>
        </div>
      )}

      {/* Acts 1 & 2 Canvas */}
      {(stage === 1 || stage === 2) && (
        <canvas ref={canvasRef} className="w-full h-full" />
      )}

      {/* Act 3: Lyric Guess */}
      {stage === 3 && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {!playlist3 ? (
            <div className="max-w-md w-full text-center space-y-4 bg-black bg-opacity-60 p-6 rounded">
              <h2 className="text-2xl font-bold">Act 3 – Guess the Song:</h2>
              <p className="text-xl">“{lyricRounds[lyricIdx].lyric}”</p>
              <input
                className="w-full px-2 py-2 bg-white text-black rounded border"
                placeholder="Type song title"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-green-400 rounded"
                onClick={handleLyricSubmit}
              >
                SUBMIT
              </button>
            </div>
          ) : (
            <div className="max-w-md w-full text-center space-y-4 bg-black bg-opacity-60 p-6 rounded">
              <p className="text-2xl">🎉 Well done! Here are 3 BTS hits:</p>
              <ul className="list-disc list-inside text-blue-300">
                <li><a href="https://spoti.fi/BTS_Dynamite" target="_blank">Dynamite</a></li>
                <li><a href="https://spoti.fi/BTS_Butter"   target="_blank">Butter</a></li>
                <li><a href="https://spoti.fi/BTS_BoyWithLuv" target="_blank">Boy With Luv</a></li>
              </ul>
              <button
                className="px-6 py-2 bg-blue-500 rounded"
                onClick={() => setStage(4)}
              >
                NEXT ACT
              </button>
            </div>
          )}
        </div>
      )}

      {/* Act 4: ARMY Quiz */}
      {stage === 4 && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {!playlist4 ? (
            <div className="max-w-md w-full text-center space-y-4 bg-black bg-opacity-60 p-6 rounded">
              <h2 className="text-2xl font-bold">Act 4 – ARMY Quiz:</h2>
              <p className="text-xl">{quizQuestions[quizIdx].q}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {quizQuestions[quizIdx].choices.map(c => (
                  <button
                    key={c}
                    className="px-3 py-2 bg-gray-200 text-black rounded"
                    onClick={() => handleQuizChoice(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-md w-full text-center space-y-4 bg-black bg-opacity-60 p-6 rounded">
              <p className="text-2xl">🎉 You’re a true ARMY! Here are 3 more hits:</p>
              <ul className="list-disc list-inside text-blue-300">
                <li><a href="https://spoti.fi/BTS_Fire" target="_blank">Fire</a></li>
                <li><a href="https://spoti.fi/BTS_DNA"  target="_blank">DNA</a></li>
                <li><a href="https://spoti.fi/BTS_Idol" target="_blank">Idol</a></li>
              </ul>
              <button
                className="px-6 py-2 bg-purple-600 rounded"
                onClick={() => setStage(5)}
              >
                FINAL ACT
              </button>
            </div>
          )}
        </div>
      )}

      {/* Act 5: Final */}
      {stage === 5 && (
  <div className="relative w-full h-full">
    {/* 1. Full-screen background */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/btsgroup.jpg')" }}
    />

    {/* 2. Semi-overlay for readability */}
    <div className="absolute inset-0 bg-black/30" />

    {/* 3. Your Act 5 content on top */}
    <div className="relative z-10 flex flex-col items-center justify-center p-4 text-white space-y-4 h-full text-center">
      {!showPart2 ? (
        <>
          <h1 className="text-3xl font-semibold">Hope you enjoyed Part 1!</h1>
          <p>Click YES if you’d like to unlock Part 2.</p>
          <button
            onClick={() => setShowPart2(true)}
            className="px-6 py-2 bg-pink-600 rounded-full text-white"
          >
            YES
          </button>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold">Wanna experience Part 2?</h1>
          <p>It begins the moment you reach Jaipur. 🌇</p>
        </>
      )}
      <p className="italic text-gray-200 mt-6">
        From all 7 of us — Happy Birthday, Divya! 💜
      </p>
    </div>
  </div>
)}

    </div>
  )
}
