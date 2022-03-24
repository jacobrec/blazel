import React, { useState, useEffect, useRef } from 'react'
import {useChatScroll, useDataLoader} from 'use-chat-scroll'
import { v4 as uuidv4 } from 'uuid'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GoodMessages, BadMessages } from './messages'

const targetHours = 4
const targetMinutes = 20

const serveruser = {
    name: "🔥 Blaze Chat 🔥",
    email: "noreply@example.com",
    picture: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/313/fire_1f525.png"
}

const welcomeMessage = {
    body: `Welcome to Blaze Chat!
The best wordle clone around!
The game is to hit the blaze button at exactly ${targetHours}:${targetMinutes} each day.
Morning or afternoon works!
Best of luck!`,
    timestamp: 0,
    author: serveruser
}

export const useInterval = (callback: Function, delay: number) => {
    const savedCallback: any = useRef()
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])
    useEffect(() => {
        function tick() {
            savedCallback.current()
        }
        if (delay !== null) {
            const id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}


interface User {
    name: string
    email: string
    picture: string
}

interface Message {
    body: string
    timestamp: number
    author: User
}

function shareMessage(): string {
    const usr = JSON.parse(localStorage.getItem('usr') || '{}')
    const streak = JSON.parse(localStorage.getItem('streak') || '{}')
    const streakStr = '🔥'.repeat(streak.current || 0)
    return `${usr.name}'s Blazel
Current streak: ${streakStr}
Max streak: ${streak.max}
Join the fun: ${window.location}
    `
}

const defaultImageUrl = 'https://www.pngfind.com/pngs/m/676-6764065_default-profile-picture-transparent-hd-png-download.png'
function newUser () {
    if (!localStorage.getItem('usr')) {
        const name = prompt('Enter Name:') || ''
        const picture = prompt('Enter a URL for your profile picture:') || defaultImageUrl
        localStorage.setItem('usr', JSON.stringify({ name, picture, email: uuidv4() }))
        localStorage.setItem('streak', JSON.stringify({ max: 0, current: 0 }))
    }
    return JSON.parse(localStorage.getItem('usr') || '')
}

const OverlayWelcome = (p:any) => (<Overlay>
            <div style={{backgroundColor: 'white', padding: '8px', margin:'10px', boxShadow: '0 4px 8px 0 #00000033', maxWidth: '80vw', display: 'flex', alignItems: 'center'}}>
                <img src={welcomeMessage.author.picture} width='30px' height='30px' style={{margin: '5px', marginRight: '10px'}} />
                <div>
                    <p style={{fontSize: '10px', marginBottom: '5px'}}>{welcomeMessage.author.name}</p>
                    <div style={{display:'block'}}> { welcomeMessage.body.split('\n').map(m => (<p> {m} </p>)) } </div>
                </div>
            </div>
</Overlay>)

function OverlayProfile (props: any) {
    const setUser = (user: User) => {
        props.setCurrentUser(user)
        localStorage.setItem('usr', JSON.stringify(user))
    }
    const setURL = (url: string) => setUser({...props.currentUser, picture: url})
    const setName = (url: string) => setUser({...props.currentUser, name: url})
    return (
        <Overlay>
            <div style={{backgroundColor: 'white', padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100px'}}>
                <h2>Profile</h2>
                <p style={{whiteSpace:'pre'}}>{shareMessage()}</p>
                <div>
                    <label htmlFor="profile-name">Name</label>
                    <input id="profile-name" onChange={(e) => setName(e.target.value)} value={props.currentUser.name} />
                </div>
                <div>
                    <label htmlFor="profile-picture-url">Profile URL</label>
                    <input id="profile-picture-url" onChange={(e) => setURL(e.target.value)} value={props.currentUser.profile} />
                </div>
                <img src={props.currentUser.picture} width='30px' height='30px' style={{margin: '5px', marginRight: '10px'}} />
            </div>
        </Overlay>
    )
}
let overlayClickCallback: any
function App() {
    const [messages, setMessages] = useState([] as Message[])
    const [currentUser, setCurrentUser] = useState(newUser())
    const [showProfile, setShowProfile] = useState(false)
    const [showWelcome, setShowWelcome] = useState(true)
    const sendProps = { messages, setMessages, currentUser }
    const msgProps = (m: Message) => ({ msg: m, currentUser })
    const profileProps = { currentUser, setCurrentUser }
    const containerRef: any = useRef<React.MutableRefObject<HTMLDivElement>>(null)
    const loader = useDataLoader((messages) => getOlderMessages(messages), messages, setMessages, [messages])
    overlayClickCallback = () => { setShowProfile(false); setShowWelcome(false) }
    useChatScroll(containerRef, messages, loader)
    useInterval(() => getNewerMessages(messages, setMessages), 1000)
    return (
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100vh'}}>
              <div style={{height: '15vh', backgroundColor: '#FFA500', color: 'white', display: 'flex', justifyContent: 'space-between'}}>
                  <h1 style={{fontSize:'8vh', lineHeight:'15vh', marginLeft: '40px'}}>Blazel</h1>
                  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', marginRight: '30px'}}>
                      <button onClick={() => { navigator.clipboard.writeText(shareMessage()); toast('copied')}}>Share</button>
                      <button onClick={() => setShowProfile(true)}>Profile</button>
                  </div>
              </div>
              <div ref={containerRef} style={{overflow: 'auto'}}>
                  { messages.map(m => <Message {...msgProps(m)} /> ) }
              </div>
              <div style={{height: '15vh'}}>
                  <SendButton {...sendProps} />
              </div>
          {  (showWelcome) ? <OverlayWelcome /> : null }
          {  (showProfile) ? <OverlayProfile {...profileProps} /> : null }
          </div>
          <ToastContainer
            position="bottom-center"
            autoClose={2000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            draggable
            />
        </div>
    );
}

function Overlay (props: any) {
    return (
        <div
            style={{width: '100vw', height: '100vh', backgroundColor: '#000000cc', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            {props.children}
            <button onClick={() => overlayClickCallback() } >Close</button>
        </div>
    )
}

function SendButton (props: {
    messages: Message[],
    setMessages: (m: Message[]) => void,
    currentUser: User
}) {
    function sendMessage() {
        const time = new Date()
        const isBlaze = (time.getHours() % 12 === targetHours) && (time.getMinutes() === targetMinutes)

        // Manage streak
        const lastBlazed = JSON.parse(localStorage.getItem('last') || '0') || 0
        const streak = JSON.parse(localStorage.getItem('streak') || '{}') || {}
        if (lastBlazed < time.getTime() - 1000 * 60 * 60 * 24) {
            streak.current = 0
        }
        if (isBlaze) {
            streak.current ++
            streak.max = Math.max(streak.current, streak.max)
        } else {
            streak.current = 0
        }
        localStorage.setItem('streak', JSON.stringify(streak))
        localStorage.setItem('last', JSON.stringify(time.getTime()))

        // Send message to server
        const message = { author: props.currentUser, timestamp: time.getTime() / 1000, body: generateMessage(isBlaze) }
        props.setMessages(props.messages.concat([message]))
        fetch('/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        })
    }
    return <button
               style={{height:'100%', width: '100%', fontSize: '10vh'}}
               onClick={() => {
                   const time = new Date()
                   const lastBlazed = JSON.parse(localStorage.getItem('last') || '0') || 0
                   if (lastBlazed + 1000 * 60 * 60 * 2 > time.getTime()) {
                       toast('You already tried this blaze, try again later')
                   } else if (time.getHours() % 12 === targetHours) {
                       sendMessage()
                   } else {
                       toast('Patience, it\'s not yet time')
                   }
               }}
           >🔥</button>
}

function Message (props: {msg: Message, currentUser: User}) {
    const isUserMsg = props.msg.author.email === props.currentUser.email
    const usrMsg = (<div style={{display:'block'}}> { props.msg.body.split('\n').map(m => (<p> {m} </p>)) } </div>)
    const nonUsrMsg = (<>
        <img src={props.msg.author.picture} width='30px' height='30px' style={{margin: '5px', marginRight: '10px'}} />
        <div>
            <p style={{fontSize: '10px', marginBottom: '5px'}}>{props.msg.author.name}</p>
            { usrMsg }
        </div>
    </>)
    return (
        <div key={props.msg.author.email+props.msg.timestamp} style={{width: '98vw', display: 'flex', justifyContent: isUserMsg? 'end' : 'start'}}>
            <div style={{backgroundColor: 'white', padding: '8px', marginRight:0, margin:'10px', boxShadow: '0 4px 8px 0 #00000033', maxWidth: '80vw', display: 'flex', alignItems: 'center'}}>
                { isUserMsg ? usrMsg : nonUsrMsg }
            </div>
        </div>
    )
}

function generateMessage (isGood: boolean): string {
    const msgs = isGood ? GoodMessages : BadMessages
    return msgs[Math.floor(msgs.length * Math.random())]
}

async function getNewerMessages (messages: Message[], setMessages: (m: Message[]) => void): Promise<void> {
    const response = await fetch(messages.length === 0 ? '/messages' : `/messages?newer=${messages[messages.length-1].timestamp}`)
    const msgs: Message[] = (await response.json()) as Message[]
    setMessages(Array.from(new Set(messages.concat(msgs))).sort((a: Message, b: Message) => a.timestamp - b.timestamp))

}

async function getOlderMessages (messages: Message[]): Promise<Message[]> {
    const response = await fetch(messages.length === 0 ? '/messages' : `/messages?older=${messages[0].timestamp}`)
    const msgs: Message[] = (await response.json()) as Message[]
    return msgs
}

export default App;
