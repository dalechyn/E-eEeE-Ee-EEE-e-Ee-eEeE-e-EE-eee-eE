import {  Frog } from 'frog'
import { devtools } from 'frog/dev'
import { neynar } from 'frog/middlewares';
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'


const morseCodeMap: { [key: string]: string } = {
 'A': '.-', 'B': '-...',  'C': '-.-.', 
  'D': '-..', 'E': '.',  'F': '..-.', 
  'G': '--.', 'H': '....',  'I': '..',   'J': '.---',  'K': '-.-', 'L': '.-..', 
  'M': '--',  'N': '-.',  'O': '---', 
  'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...', 'T': '-', 'U': '..-', 
  'V': '...-', 'W': '.--', 'X': '-..-', 
  'Y': '-.--', 'Z': '--..',  '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '0': '-----', ' ': '/'
};

const morseToCharMap = Object.fromEntries(Object.entries(morseCodeMap).map(([key,value])=>([value,key])))

const encode = (text: string): string => {
  return text.toUpperCase().split('').map(char => {
    const value = morseCodeMap[char.toUpperCase()];
    if (!value) throw new Error('Unsupported symbol.')
    return value.split('').map(value => {
    if (value === '.') return 'E'
    if (value === '-') return 'e'
    if (value === ' ') return ''
    }).join('')
  }).join(' ');
};

const decode = (dolphin: string): string => {
  return dolphin.split(' ').map(dolphinWord => {
    const morseChar = dolphinWord.split('').map((dolphinChar) => {
      if (dolphinChar === 'E') return '.'
      if (dolphinChar === 'e') return '-'
      if (dolphinChar === ' ') return '/'
      return ''
    }).join('')
    return morseToCharMap[morseChar] || '';
  }).join('');
};

export const app = new Frog({
  title: encode('Dolphin Says'),
  assetsPath: '/',
  basePath: '/api',
}).use(neynar({apiKey: 'NEYNAR_FROG_FM', features: ['cast']}))

app.castAction('/', (c) => {
  if (!c.var.cast?.text) return c.error({message: 'No text in cast.'})

  try {
    return c.message({message:`🐬: ${decode(c.var.cast.text)}`})
  } catch (err) {
    return c.error(err as Error)
  }
}, {
    name: encode('Dolphin Says'),
    icon: 'log'
  })

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
