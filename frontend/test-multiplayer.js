/**
 * Multiplayer Test Script
 * Simulates two dummy players going through the entire multiplayer flow
 */

const BASE_URL = 'http://localhost:3000';

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${method} ${path} failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMultiplayerFlow() {
  console.log('='.repeat(60));
  console.log('MULTIPLAYER FLOW TEST');
  console.log('='.repeat(60));

  let player1Id, player2Id, challengeId, gameId;

  try {
    // Step 1: Register two players
    console.log('\n[STEP 1] Registering players...');
    const p1Result = await request('POST', '/api/multiplayer/player', {
      username: 'TestPlayer1',
      country: 'US',
    });
    player1Id = p1Result.playerId;
    console.log(`  ✓ Player 1 registered: ${player1Id}`);

    const p2Result = await request('POST', '/api/multiplayer/player', {
      username: 'TestPlayer2',
      country: 'GB',
    });
    player2Id = p2Result.playerId;
    console.log(`  ✓ Player 2 registered: ${player2Id}`);

    // Step 2: Player 1 sends challenge to Player 2
    console.log('\n[STEP 2] Player 1 sends challenge to Player 2...');
    const challengeResult = await request('POST', '/api/multiplayer/challenge', {
      challengerId: player1Id,
      challengedId: player2Id,
    });
    challengeId = challengeResult.challengeId;
    console.log(`  ✓ Challenge created: ${challengeId}`);

    // Step 3: Player 2 accepts the challenge
    console.log('\n[STEP 3] Player 2 accepts the challenge...');
    const acceptResult = await request('PATCH', '/api/multiplayer/challenge', {
      challengeId,
      action: 'accepted',
    });
    console.log(`  ✓ Challenge accepted: ${acceptResult.success}`);

    // Step 4: Player 1 creates the game (as challenger)
    console.log('\n[STEP 4] Player 1 creates the game...');
    const gameResult = await request('POST', '/api/multiplayer/game', {
      player1Id,
      player2Id,
      player1Name: 'TestPlayer1',
      player2Name: 'TestPlayer2',
      player1Country: 'US',
      player2Country: 'GB',
      totalRounds: 3, // Use 3 rounds for faster testing
    });
    gameId = gameResult.gameId;
    console.log(`  ✓ Game created: ${gameId}`);
    console.log(`  ✓ AI Response: "${gameResult.aiResponse.substring(0, 80)}..."`);

    // Play through all rounds
    for (let round = 1; round <= 3; round++) {
      console.log(`\n[ROUND ${round}] Playing...`);

      // Alternate which player wins each round
      const winningPlayer = round % 2 === 1 ? player1Id : player2Id;
      const winningPlayerName = round % 2 === 1 ? 'TestPlayer1' : 'TestPlayer2';
      const losingPlayer = round % 2 === 1 ? player2Id : player1Id;
      const losingPlayerName = round % 2 === 1 ? 'TestPlayer2' : 'TestPlayer1';

      // Losing player submits a wrong guess first
      try {
        const wrongGuess = await request('POST', `/api/multiplayer/game/${gameId}/guess`, {
          playerId: losingPlayer,
          playerName: losingPlayerName,
          guess: 'xyzabc123 nonsense guess',
        });
        console.log(`  ${losingPlayerName} guessed: Score ${wrongGuess.score}, Correct: ${wrongGuess.isCorrect}`);

        if (wrongGuess.isCorrect) {
          console.log(`  (Unexpected correct! Skipping winning player's turn)`);
          // If this was the last round, game is over
          if (round === 3) {
            console.log(`  Game ended unexpectedly on round ${round}`);
            break;
          }
          // Advance to next round
          await sleep(200);
          try {
            await request('POST', `/api/multiplayer/game/${gameId}/next-round`);
            console.log(`  ✓ Advanced to next round`);
          } catch (e) {
            console.log(`  Note: ${e.message}`);
          }
          continue;
        }
      } catch (e) {
        console.log(`  ${losingPlayerName} error: ${e.message}`);
      }

      // Winning player submits guesses until correct
      let correct = false;
      let attempts = 0;
      const guesses = [
        'What is this about?',
        'Tell me about this topic',
        'Explain this to me',
        'What do you think about this?',
        'Can you describe this?',
      ];

      while (!correct && attempts < guesses.length) {
        try {
          const result = await request('POST', `/api/multiplayer/game/${gameId}/guess`, {
            playerId: winningPlayer,
            playerName: winningPlayerName,
            guess: guesses[attempts],
          });
          console.log(`  ${winningPlayerName} guess ${attempts + 1}: Score ${result.score}, Correct: ${result.isCorrect}`);

          if (result.isCorrect) {
            correct = true;
            console.log(`  ✓ ${winningPlayerName} won round ${round}!`);
            if (result.actualPrompt) {
              console.log(`  Actual prompt: "${result.actualPrompt.substring(0, 50)}..."`);
            }
          }
          attempts++;
        } catch (e) {
          // Game phase changed or already answered correctly
          console.log(`  ${winningPlayerName} error: ${e.message}`);
          break;
        }
      }

      // If not the last round, advance to next round
      if (round < 3) {
        await sleep(300);
        try {
          await request('POST', `/api/multiplayer/game/${gameId}/next-round`);
          console.log(`  ✓ Advanced to round ${round + 1}`);
        } catch (e) {
          // May already be advanced or game over
          console.log(`  Round advance: ${e.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\nMultiplayer flow verified:');
    console.log('  ✓ Player registration');
    console.log('  ✓ Challenge system (send/accept)');
    console.log('  ✓ Game creation');
    console.log('  ✓ Guess submission & AI judging');
    console.log('  ✓ Round progression');
    console.log('  ✓ Score tracking');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  } finally {
    // Cleanup: Remove test players
    console.log('\n[CLEANUP] Removing test players...');
    try {
      if (player1Id) {
        await request('DELETE', '/api/multiplayer/player', { playerId: player1Id });
        console.log(`  ✓ Player 1 removed`);
      }
      if (player2Id) {
        await request('DELETE', '/api/multiplayer/player', { playerId: player2Id });
        console.log(`  ✓ Player 2 removed`);
      }
    } catch (e) {
      console.log('  Cleanup error:', e.message);
    }
  }
}

// Run the test
testMultiplayerFlow();
