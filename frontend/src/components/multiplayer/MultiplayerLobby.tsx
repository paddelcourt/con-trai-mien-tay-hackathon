'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import {
  MpPlayer, MpChallenge, MpGame,
  registerMpPlayer, removeMpPlayer, sendHeartbeat,
  sendChallenge, respondToChallenge, createMpGame,
} from '@/services/api';
import { countries } from '@/components/UsernameModal';
import Link from 'next/link';

const countryFlags: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪',
  FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷', BR: '🇧🇷', IN: '🇮🇳',
  MX: '🇲🇽', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', SE: '🇸🇪',
  VN: '🇻🇳', PH: '🇵🇭', SG: '🇸🇬', OTHER: '🌍',
};

interface MultiplayerLobbyProps {
  username: string;
  country: string;
  onGameStart: (gameId: string, myPlayerId: string, game: MpGame, aiResponse: string) => void;
}

export default function MultiplayerLobby({ username, country, onGameStart }: MultiplayerLobbyProps) {
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<MpPlayer[]>([]);
  const [incomingChallenge, setIncomingChallenge] = useState<(MpChallenge & { challengerName: string }) | null>(null);
  const [pendingChallengeId, setPendingChallengeId] = useState<string | null>(null);
  const [challengedPlayerId, setChallengedPlayerId] = useState<string | null>(null);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const playerIdRef = useRef<string | null>(null);

  // Register player on mount
  useEffect(() => {
    let mounted = true;

    const register = async () => {
      try {
        const { playerId } = await registerMpPlayer(username, country);
        if (!mounted) {
          // Cleanup if component unmounted before registration completed
          await removeMpPlayer(playerId);
          return;
        }
        setMyPlayerId(playerId);
        playerIdRef.current = playerId;

        // Start heartbeat
        heartbeatRef.current = setInterval(() => {
          if (playerIdRef.current) {
            sendHeartbeat(playerIdRef.current);
          }
        }, 20000);
      } catch (e) {
        console.error('Failed to register:', e);
        if (mounted) setError('Failed to connect to lobby. Please refresh.');
      }
    };

    register();

    return () => {
      mounted = false;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (playerIdRef.current) {
        removeMpPlayer(playerIdRef.current);
      }
    };
  }, [username, country]);

  // Set up Realtime subscriptions
  useEffect(() => {
    if (!myPlayerId) return;

    // Fetch initial player list
    const fetchPlayers = async () => {
      const { data } = await supabaseBrowser
        .from('mp_players')
        .select('*')
        .neq('id', myPlayerId)
        .order('updated_at', { ascending: false });
      if (data) {
        // Only show players active in last 60s
        const now = Date.now();
        setOnlinePlayers(
          data.filter((p) => now - new Date(p.updated_at).getTime() < 60000)
        );
      }
    };
    fetchPlayers();

    // Subscribe to lobby player changes
    const lobbyChannel = supabaseBrowser
      .channel(`mp-lobby-players-${myPlayerId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mp_players' },
        async () => {
          // Refetch the list on any change
          const { data } = await supabaseBrowser
            .from('mp_players')
            .select('*')
            .neq('id', myPlayerId)
            .order('updated_at', { ascending: false });
          if (data) {
            const now = Date.now();
            setOnlinePlayers(
              data.filter((p) => now - new Date(p.updated_at).getTime() < 60000)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to incoming challenges
    const challengeChannel = supabaseBrowser
      .channel(`mp-challenges-${myPlayerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mp_challenges',
          filter: `challenged_id=eq.${myPlayerId}`,
        },
        async (payload) => {
          const challenge = payload.new as MpChallenge;
          // Fetch challenger name
          const { data: challenger } = await supabaseBrowser
            .from('mp_players')
            .select('username')
            .eq('id', challenge.challenger_id)
            .single();
          setIncomingChallenge({
            ...challenge,
            challengerName: challenger?.username || 'Unknown',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mp_challenges',
          filter: `challenger_id=eq.${myPlayerId}`,
        },
        async (payload) => {
          const challenge = payload.new as MpChallenge;
          if (challenge.status === 'accepted' && pendingChallengeId === challenge.id) {
            // Opponent accepted! Create the game (challenger creates it)
            await handleCreateGame(challenge);
          } else if (challenge.status === 'rejected') {
            setPendingChallengeId(null);
            setChallengedPlayerId(null);
            setError('Challenge was rejected.');
            setTimeout(() => setError(null), 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(lobbyChannel);
      supabaseBrowser.removeChannel(challengeChannel);
    };
  }, [myPlayerId, pendingChallengeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateGame = useCallback(async (challenge: MpChallenge) => {
    if (!myPlayerId || isCreatingGame) return;
    setIsCreatingGame(true);

    try {
      // Fetch both player details
      const { data: players } = await supabaseBrowser
        .from('mp_players')
        .select('*')
        .in('id', [challenge.challenger_id, challenge.challenged_id]);

      const challenger = players?.find((p) => p.id === challenge.challenger_id);
      const challenged = players?.find((p) => p.id === challenge.challenged_id);

      if (!challenger || !challenged) throw new Error('Players not found');

      const { gameId, aiResponse } = await createMpGame(
        challenger.id,
        challenged.id,
        challenger.username,
        challenged.username,
        challenger.country,
        challenged.country,
        5
      );

      // Fetch full game record
      const { data: game } = await supabaseBrowser
        .from('mp_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (game) {
        onGameStart(gameId, myPlayerId, game as MpGame, aiResponse);
      }
    } catch (e) {
      console.error('Failed to create game:', e);
      setError('Failed to start game. Please try again.');
      setIsCreatingGame(false);
    }
  }, [myPlayerId, isCreatingGame, onGameStart]);

  const handleChallenge = async (player: MpPlayer) => {
    if (!myPlayerId || pendingChallengeId) return;

    try {
      setChallengedPlayerId(player.id);
      const { challengeId } = await sendChallenge(myPlayerId, player.id);
      setPendingChallengeId(challengeId);
    } catch (e) {
      console.error('Failed to send challenge:', e);
      setError('Failed to send challenge.');
      setChallengedPlayerId(null);
    }
  };

  const handleAcceptChallenge = async () => {
    if (!incomingChallenge || !myPlayerId) return;

    try {
      const { challenge } = await respondToChallenge(incomingChallenge.id, 'accepted');
      setIncomingChallenge(null);

      // The challenger will create the game; we subscribe to mp_games to detect it
      const gameWatchChannel = supabaseBrowser
        .channel(`mp-game-watch-${myPlayerId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mp_games',
            filter: `player2_id=eq.${myPlayerId}`,
          },
          async (payload) => {
            const game = payload.new as MpGame;
            // Fetch AI response for this game
            const { data: round } = await supabaseBrowser
              .from('rounds')
              .select('ai_response')
              .eq('id', game.current_round_id)
              .single();

            supabaseBrowser.removeChannel(gameWatchChannel);
            onGameStart(game.id, myPlayerId, game, round?.ai_response || '');
          }
        )
        .subscribe();

      void challenge; // suppress unused var warning
    } catch (e) {
      console.error('Failed to accept challenge:', e);
      setError('Failed to accept challenge.');
      setIncomingChallenge(null);
    }
  };

  const handleRejectChallenge = async () => {
    if (!incomingChallenge) return;
    try {
      await respondToChallenge(incomingChallenge.id, 'rejected');
    } catch (e) {
      console.error('Failed to reject challenge:', e);
    } finally {
      setIncomingChallenge(null);
    }
  };

  const cancelChallenge = () => {
    setPendingChallengeId(null);
    setChallengedPlayerId(null);
  };

  const flag = countryFlags[country] || '🌍';

  return (
    <div className="min-h-screen bg-[#212121] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f2f2f] bg-[#171717]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[#8e8e8e] hover:text-[#ececec] transition-colors p-1.5 rounded-lg hover:bg-[#2f2f2f]"
            title="Back to solo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-[#ececec]">Multiplayer Lobby</h1>
            <p className="text-[10px] text-[#8e8e8e]">Challenge other players</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#383838] flex items-center justify-center text-xs">{flag}</div>
          <span className="text-sm text-[#ececec]">{username}</span>
          <div className={`w-2 h-2 rounded-full ${myPlayerId ? 'bg-[#10b981]' : 'bg-[#8e8e8e] animate-pulse'}`} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-xs text-[#ef4444] animate-fade-in">
          {error}
        </div>
      )}

      {/* Incoming challenge notification */}
      {incomingChallenge && (
        <div className="mx-4 mt-3 p-4 bg-[#2f2f2f] border border-[#10a37f]/30 rounded-xl animate-slide-up shadow-lg">
          <p className="text-sm text-[#ececec] font-medium mb-3">
            <span className="text-[#10a37f]">{incomingChallenge.challengerName}</span> wants to challenge you!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptChallenge}
              className="flex-1 py-2 rounded-lg bg-[#10a37f] hover:bg-[#1a7f64] text-white text-sm font-medium transition-colors"
            >
              Accept
            </button>
            <button
              onClick={handleRejectChallenge}
              className="flex-1 py-2 rounded-lg bg-[#383838] hover:bg-[#444444] text-[#ececec] text-sm font-medium transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Creating game loader */}
      {isCreatingGame && (
        <div className="mx-4 mt-3 p-4 bg-[#2f2f2f] border border-[#10a37f]/20 rounded-xl text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 text-sm text-[#10a37f]">
            <div className="w-4 h-4 border-2 border-[#10a37f] border-t-transparent rounded-full animate-spin" />
            Starting game...
          </div>
        </div>
      )}

      {/* Pending challenge banner */}
      {pendingChallengeId && !isCreatingGame && (
        <div className="mx-4 mt-3 p-3 bg-[#2f2f2f] border border-[#f59e0b]/20 rounded-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#f59e0b]">
              Waiting for opponent to accept...
            </span>
            <button
              onClick={cancelChallenge}
              className="text-[10px] text-[#8e8e8e] hover:text-[#ececec] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Player list */}
      <div className="flex-1 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-[#8e8e8e] uppercase tracking-wider">Online Players</h2>
            <span className="text-xs text-[#8e8e8e]">{onlinePlayers.length} online</span>
          </div>

          {!myPlayerId && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#10a37f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#8e8e8e]">Connecting to lobby...</p>
            </div>
          )}

          {myPlayerId && onlinePlayers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">🎮</div>
              <p className="text-sm text-[#8e8e8e] mb-1">No other players online</p>
              <p className="text-xs text-[#565656]">Share this page with a friend to play!</p>
            </div>
          )}

          <div className="space-y-2">
            {onlinePlayers.map((player) => {
              const playerFlag = countryFlags[player.country] || '🌍';
              const isChallenged = challengedPlayerId === player.id;
              const isIdle = player.status === 'idle';

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-[#2f2f2f] rounded-xl border border-[#383838] hover:border-[#444444] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#383838] flex items-center justify-center text-sm">
                      {playerFlag}
                    </div>
                    <div>
                      <div className="text-sm text-[#ececec] font-medium">{player.username}</div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          player.status === 'idle' ? 'bg-[#10b981]' :
                          player.status === 'in_game' ? 'bg-[#f59e0b]' : 'bg-[#8e8e8e]'
                        }`} />
                        <span className="text-[10px] text-[#8e8e8e]">
                          {player.status === 'idle' ? 'Available' :
                           player.status === 'in_game' ? 'In game' : 'Busy'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleChallenge(player)}
                    disabled={!isIdle || !!pendingChallengeId || isChallenged}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isChallenged
                        ? 'bg-[#f59e0b]/10 text-[#f59e0b] cursor-not-allowed'
                        : isIdle && !pendingChallengeId
                        ? 'bg-[#10a37f] hover:bg-[#1a7f64] text-white'
                        : 'bg-[#383838] text-[#565656] cursor-not-allowed'
                    }`}
                  >
                    {isChallenged ? 'Pending...' : 'Challenge'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How to play */}
      <div className="px-4 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="p-3 bg-[#171717] rounded-xl border border-[#2f2f2f]">
            <p className="text-[10px] text-[#565656] text-center leading-relaxed">
              Both players see the same AI response • First to guess the prompt wins the round • Best of 5 rounds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
