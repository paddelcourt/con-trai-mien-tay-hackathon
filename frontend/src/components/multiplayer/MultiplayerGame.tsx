'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import {
  MpGame, MpRoundGuess, submitMpGuess, advanceToNextRound,
} from '@/services/api';
import PlayerBoard from './PlayerBoard';
import RoundResultOverlay from './RoundResultOverlay';
import GameOverScreen from './GameOverScreen';
import AIMessage from '@/components/AIMessage';
import PromptInput from '@/components/PromptInput';

interface MultiplayerGameProps {
  gameId: string;
  myPlayerId: string;
  myName: string;
  initialGame: MpGame;
  initialAiResponse: string;
  onBackToLobby: () => void;
}

export default function MultiplayerGame({
  gameId,
  myPlayerId,
  myName,
  initialGame,
  initialAiResponse,
  onBackToLobby,
}: MultiplayerGameProps) {
  const [game, setGame] = useState<MpGame>(initialGame);
  const [aiResponse, setAiResponse] = useState(initialAiResponse);
  const [myGuesses, setMyGuesses] = useState<MpRoundGuess[]>([]);
  const [opponentGuesses, setOpponentGuesses] = useState<MpRoundGuess[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [opponentIsTyping, setOpponentIsTyping] = useState(false);
  const [roundActualPrompt, setRoundActualPrompt] = useState<string | null>(null);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [isLoadingNewRound, setIsLoadingNewRound] = useState(false);

  const opponentTypingTimer = useRef<NodeJS.Timeout | null>(null);
  const broadcastChannelRef = useRef<ReturnType<typeof supabaseBrowser.channel> | null>(null);
  const isAdvancingRound = useRef(false);

  const isPlayer1 = game.player1_id === myPlayerId;
  const opponentId = isPlayer1 ? game.player2_id : game.player1_id;
  const opponentName = isPlayer1 ? game.player2_name : game.player1_name;
  const myScore = isPlayer1 ? game.player1_score : game.player2_score;
  const opponentScore = isPlayer1 ? game.player2_score : game.player1_score;
  const opponentCountry = isPlayer1 ? game.player2_country : game.player1_country;
  const myCountry = isPlayer1 ? game.player1_country : game.player2_country;

  // Set up Supabase Realtime subscriptions
  useEffect(() => {
    // Subscribe to game state changes
    const gameChannel = supabaseBrowser
      .channel(`mp-game-state-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mp_games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const newGame = payload.new as MpGame;
          setGame(newGame);

          // When a new round starts after round_over, reset state
          if (newGame.phase === 'playing' && payload.old && (payload.old as MpGame).phase === 'round_over') {
            setMyGuesses([]);
            setOpponentGuesses([]);
            setHasAnsweredCorrectly(false);
            setRoundActualPrompt(null);
            setIsLoadingNewRound(true);
            isAdvancingRound.current = false;
          }
        }
      )
      .subscribe();

    // Subscribe to guess events
    const guessChannel = supabaseBrowser
      .channel(`mp-game-guesses-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mp_round_guesses',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const newGuess = payload.new as MpRoundGuess;
          if (newGuess.player_id === myPlayerId) {
            setMyGuesses((prev) => {
              // Avoid duplicates from optimistic updates
              if (prev.find((g) => g.id === newGuess.id)) return prev;
              return [...prev, newGuess];
            });
            if (newGuess.is_correct) {
              setHasAnsweredCorrectly(true);
              setRoundActualPrompt(newGuess.guess); // Will be overridden by API result
            }
          } else {
            setOpponentGuesses((prev) => {
              if (prev.find((g) => g.id === newGuess.id)) return prev;
              return [...prev, newGuess];
            });
          }
        }
      )
      .subscribe();

    // Broadcast channel for typing indicators
    const broadcastChannel = supabaseBrowser
      .channel(`mp-game-typing-${gameId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.playerId !== myPlayerId) {
          setOpponentIsTyping(true);
          if (opponentTypingTimer.current) clearTimeout(opponentTypingTimer.current);
          opponentTypingTimer.current = setTimeout(() => setOpponentIsTyping(false), 2000);
        }
      })
      .subscribe();

    broadcastChannelRef.current = broadcastChannel;

    return () => {
      supabaseBrowser.removeChannel(gameChannel);
      supabaseBrowser.removeChannel(guessChannel);
      supabaseBrowser.removeChannel(broadcastChannel);
      if (opponentTypingTimer.current) clearTimeout(opponentTypingTimer.current);
    };
  }, [gameId, myPlayerId]);

  // Fetch the AI response when the round changes
  useEffect(() => {
    if (!game.current_round_id || !isLoadingNewRound) return;

    const fetchNewRoundResponse = async () => {
      try {
        const response = await fetch(`/api/multiplayer/game/${gameId}/round-info`);
        if (response.ok) {
          const data = await response.json();
          setAiResponse(data.aiResponse);
        }
      } catch (e) {
        console.error('Failed to fetch round info:', e);
      } finally {
        setIsLoadingNewRound(false);
      }
    };

    fetchNewRoundResponse();
  }, [game.current_round_id, isLoadingNewRound, gameId]);

  // Handle advancing to next round (both players trigger this after countdown)
  const handleContinueToNextRound = useCallback(async () => {
    if (isAdvancingRound.current) return;
    isAdvancingRound.current = true;
    try {
      await advanceToNextRound(gameId);
    } catch (e) {
      console.error('Failed to advance round:', e);
      isAdvancingRound.current = false;
    }
  }, [gameId]);

  // Broadcast typing event
  const handleTyping = useCallback(() => {
    broadcastChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { playerId: myPlayerId },
    });
  }, [myPlayerId]);

  const handleGuessSubmit = useCallback(async (guess: string) => {
    if (isSubmitting || hasAnsweredCorrectly || game.phase !== 'playing') return;

    setIsSubmitting(true);

    try {
      const result = await submitMpGuess(gameId, myPlayerId, myName, guess);

      if (result.isCorrect && result.actualPrompt) {
        setRoundActualPrompt(result.actualPrompt);
        setHasAnsweredCorrectly(true);
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, hasAnsweredCorrectly, game.phase, gameId, myPlayerId, myName]);

  // Game over screen
  if (game.phase === 'game_over') {
    return (
      <GameOverScreen
        player1Name={game.player1_name}
        player2Name={game.player2_name}
        player1Score={game.player1_score}
        player2Score={game.player2_score}
        winnerId={game.winner_id}
        player1Id={game.player1_id}
        myId={myPlayerId}
        onPlayAgain={onBackToLobby}
      />
    );
  }

  const roundWinnerId = game.round_winner_id;
  const roundWinnerName = roundWinnerId === game.player1_id
    ? game.player1_name
    : roundWinnerId === game.player2_id
    ? game.player2_name
    : null;

  // Current round's guesses only
  const myCurrentRoundGuesses = myGuesses.filter((g) => g.round_num === game.current_round - (game.phase === 'round_over' ? 1 : 0));
  const opponentCurrentRoundGuesses = opponentGuesses.filter((g) => g.round_num === game.current_round - (game.phase === 'round_over' ? 1 : 0));

  return (
    <div className="min-h-screen bg-[#212121] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2f2f2f] bg-[#171717]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="text-[#8e8e8e] hover:text-[#ececec] transition-colors p-1.5 rounded-lg hover:bg-[#2f2f2f]"
            title="Back to lobby"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <span className="text-sm text-[#ececec] font-medium">Multiplayer</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            game.phase === 'playing' ? 'bg-[#10a37f]/20 text-[#10a37f]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
          }`}>
            Round {game.current_round > game.total_rounds ? game.total_rounds : game.current_round} / {game.total_rounds}
          </span>
          <span className="text-xs text-[#8e8e8e]">{myScore} — {opponentScore}</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* AI Response */}
        <div className="border-b border-[#2f2f2f] overflow-y-auto max-h-48">
          {isLoadingNewRound ? (
            <div className="px-4 py-4 flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#2f2f2f] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#2f2f2f] rounded animate-pulse w-3/4" />
                <div className="h-3 bg-[#2f2f2f] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ) : (
            <AIMessage
              key={game.current_round_id}
              content={aiResponse}
              isRevealing={game.phase === 'round_over'}
            />
          )}
        </div>

        {/* Dual player boards */}
        <div className="flex gap-3 flex-1 overflow-hidden p-3">
          {/* My board */}
          <PlayerBoard
            playerName={myName}
            country={myCountry}
            score={myScore}
            roundGuesses={myCurrentRoundGuesses}
            isMe={true}
            isTyping={false}
            roundWon={roundWinnerId === myPlayerId}
          />

          {/* Opponent board */}
          <PlayerBoard
            playerName={opponentName}
            country={opponentCountry}
            score={opponentScore}
            roundGuesses={opponentCurrentRoundGuesses}
            isMe={false}
            isTyping={opponentIsTyping}
            roundWon={roundWinnerId === opponentId}
          />
        </div>

        {/* Input */}
        {game.phase === 'playing' && !hasAnsweredCorrectly && (
          <div className="border-t border-[#2f2f2f] pt-3 pb-4 bg-[#212121]">
            <div onChange={handleTyping as unknown as React.FormEventHandler}>
              <PromptInput
                onSubmit={handleGuessSubmit}
                disabled={isSubmitting || hasAnsweredCorrectly}
                placeholder="Guess the prompt..."
              />
            </div>
          </div>
        )}

        {game.phase === 'playing' && hasAnsweredCorrectly && (
          <div className="border-t border-[#2f2f2f] py-4 text-center">
            <p className="text-[#10a37f] text-sm font-medium">
              Correct! Waiting for opponent...
            </p>
          </div>
        )}
      </div>

      {/* Round result overlay */}
      {game.phase === 'round_over' && (
        <RoundResultOverlay
          roundNum={game.current_round}
          totalRounds={game.total_rounds}
          winnerName={roundWinnerName}
          myName={myName}
          actualPrompt={roundActualPrompt || '...'}
          player1Name={game.player1_name}
          player2Name={game.player2_name}
          player1Score={game.player1_score}
          player2Score={game.player2_score}
          onContinue={handleContinueToNextRound}
        />
      )}
    </div>
  );
}
