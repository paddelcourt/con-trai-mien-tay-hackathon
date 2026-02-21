'use client';

import { useState } from 'react';
import UsernameModal from '@/components/UsernameModal';
import MultiplayerLobby from '@/components/multiplayer/MultiplayerLobby';
import MultiplayerGame from '@/components/multiplayer/MultiplayerGame';
import { MpGame } from '@/services/api';

type View = 'setup' | 'lobby' | 'game';

interface GameSession {
  gameId: string;
  myPlayerId: string;
  game: MpGame;
  aiResponse: string;
}

export default function MultiplayerPage() {
  const [view, setView] = useState<View>('setup');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  const handleUsernameSubmit = (name: string, selectedCountry: string) => {
    setUsername(name);
    setCountry(selectedCountry);
    setView('lobby');
  };

  const handleGameStart = (
    gameId: string,
    myPlayerId: string,
    game: MpGame,
    aiResponse: string
  ) => {
    setGameSession({ gameId, myPlayerId, game, aiResponse });
    setView('game');
  };

  const handleBackToLobby = () => {
    setGameSession(null);
    setView('lobby');
  };

  if (view === 'setup') {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center p-4">
        {/* Background preview */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="text-[200px]">🎮</div>
        </div>
        <UsernameModal onSubmit={handleUsernameSubmit} />
      </div>
    );
  }

  if (view === 'game' && gameSession) {
    return (
      <MultiplayerGame
        gameId={gameSession.gameId}
        myPlayerId={gameSession.myPlayerId}
        myName={username}
        initialGame={gameSession.game}
        initialAiResponse={gameSession.aiResponse}
        onBackToLobby={handleBackToLobby}
      />
    );
  }

  return (
    <MultiplayerLobby
      username={username}
      country={country}
      onGameStart={handleGameStart}
    />
  );
}
