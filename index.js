import makeWASocket, { useSingleFileAuthState } from '@adiwajshing/baileys';
import { loadSession, saveSession } from './supabase.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const AUTH_FILE = './auth_info.json';

async function startBot() {
  const savedSession = await loadSession();
  if (savedSession) {
    fs.writeFileSync(AUTH_FILE, JSON.stringify(savedSession));
  }

  const { state, saveState } = useSingleFileAuthState(AUTH_FILE);
  const sock = makeWASocket({ auth: state });

  sock.ev.on('creds.update', () => {
    saveState();
    const newSession = JSON.parse(fs.readFileSync(AUTH_FILE));
    saveSession(newSession);
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    const text = msg?.message?.conversation || '';

    if (!text) return;

    if (text.toLowerCase() === 'hi') {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Hello from your Render-hosted bot 🤖' });
    }
  });
}

startBot();
