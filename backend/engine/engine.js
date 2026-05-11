const { spawn } = require('child_process');
const path = require('path');
const { Chess } = require('chess.js');

const BLUNDER_THRESHOLD = 150;


//Analyzes a chess position using Stockfish engine.
function analyzePosition(fen, actualSan = null, depth = 12) {
    return new Promise(async (resolve, reject) => {
        const stockfish = spawn(path.join(__dirname, '../stockfish/stockfish.exe'));
        let evalBefore = null;  // Evaluation before the user's move
        let bestMove = null;  // The best move suggested by Stockfish
        let bestSan = null;  // The SAN (Standard Algebraic Notation) of the best move
        let buffer = '';  // Buffer to accumulate Stockfish output
        const chess = new Chess(fen);  // Initialize chess instance with the given FEN
        const isWhiteMove = chess.turn() === 'w'; // Determine if it's White's turn


        //setup Stockfish engine
        stockfish.stdin.write(`uci\n`);
        stockfish.stdin.write(`position fen ${fen}\n`);
        stockfish.stdin.write(`go depth ${depth}\n`);

        stockfish.stdout.on('data', async (data) => {
            buffer += data.toString();
            const lines = buffer.split('\n');

            for (const line of lines) {     // Process each line of output from Stockfish

                // Check for evaluation score before the user's move
                if (line.includes('score cp')) {
                    const match = line.match(/score cp (-?\d+)/);
                    if (match) evalBefore = parseInt(match[1], 10);
                }
                // Check for best move suggested by Stockfish
                if (line.startsWith('bestmove')) {
                    bestMove = line.split(' ')[1];

                    if (!bestMove || bestMove === '(none)' || bestMove === 'none') {
                        console.warn('[engine] Stockfish returned no best move.');
                        stockfish.kill();
                        return resolve({ error: 'no bestmove', actualSan });
                    }

                    // Try to parse the best move
                    try {
                        const move = chess.move({
                            from: bestMove.slice(0, 2),
                            to: bestMove.slice(2, 4),
                            promotion: 'q'
                        }, { sloppy: true });

                        bestSan = move?.san || null;
                    } catch (err) {
                        console.warn('[engine] Failed to parse bestMove:', bestMove);
                        stockfish.kill();
                        return resolve({ error: 'invalid bestMove', bestMove, actualSan });
                    }

                    stockfish.kill();

                    // If no user move was passed, return basic info
                    if (!actualSan) {
                        return resolve({
                            bestMove,
                            bestSan,
                            eval: evalBefore
                        });
                    }

                    // Evaluate after user's actual move
                    const game = new Chess(fen);
                    const actualMoveObj = game.move(actualSan, { sloppy: true });  // Attempt to apply the user's move
                    if (!actualMoveObj) {
                        console.warn('[engine] Invalid actualSan:', actualSan);
                        return resolve({ error: 'invalid actualSan', actualSan });
                    }

                    const fenAfter = game.fen();
                    const evalAfterData = await analyzePosition(fenAfter, null, depth);

                    if (evalAfterData.error || evalAfterData.eval === null) {
                        return resolve({ error: 'failed to evaluate after move', actualSan });
                    }


                    const evalAfter = evalAfterData.eval;  // Evaluation after the user's move
                    const perspective = isWhiteMove ? 1 : -1;  // Perspective based on whose turn it is
                    const normalizedBefore = evalBefore * perspective;  // Normalize evaluation before the move
                    const normalizedAfter  = -evalAfter * perspective;  // Normalize evaluation after the move
                    const evalDrop = normalizedBefore - normalizedAfter;  // Calculate the drop in evaluation
                    const isBlunder = evalDrop >= BLUNDER_THRESHOLD;  // Determine if it's a blunder based on the drop threshold

                    console.log(`[engine] ${actualSan}: evalBefore=${evalBefore}, evalAfter=${evalAfter}, evalDrop=${evalDrop}, blunder=${isBlunder}`);

                    return resolve({
                        bestMove,
                        bestSan,
                        evalBefore,
                        evalAfter,
                        evalDrop,
                        actualSan,
                        isBlunder
                    });
                }
            }
        });
        // Handle any errors from Stockfish
        stockfish.stderr.on('data', (data) => console.error('[Stockfish stderr]', data.toString()));
        stockfish.on('error', reject);
        stockfish.on('exit', (code) => {
            if (!bestMove) {
                return resolve({ error: 'engine exited before bestmove' });
            }
        });
    });
}

// Gets the best move for a given position using Stockfish engine.
function getBotMove(fen, elo = 200, depth = 6) {
    return new Promise((resolve, reject) => {
        const stockfish = spawn(path.join(__dirname, '../stockfish/stockfish.exe'));
        const chess = new Chess(fen);
        let buffer = '';
        let bestMove = null;
        let bestSan = null;

        // Setup Stockfish engine with UCI protocol
        stockfish.stdin.write('uci\n');
        stockfish.stdin.write(`setoption name UCI_LimitStrength value true\n`);
        stockfish.stdin.write(`setoption name UCI_Elo value ${elo}\n`);
        stockfish.stdin.write(`position fen ${fen}\n`);
        stockfish.stdin.write(`go depth ${depth}\n`);

        stockfish.stdout.on('data', (data) => {
            buffer += data.toString();
            const lines = buffer.split('\n');

            for (const line of lines) {
                if (line.startsWith('bestmove')) {
                    bestMove = line.split(' ')[1];
                    stockfish.kill();

                    const move = chess.move({
                        from: bestMove.slice(0, 2),
                        to: bestMove.slice(2, 4),
                        promotion: 'q'
                    }, { sloppy: true });

                    bestSan = move?.san || null;

                    return resolve({
                        bestMove,
                        san: bestSan
                    });
                }
            }
        });

        stockfish.stderr.on('data', (data) => console.error('[Stockfish stderr]', data.toString()));
        stockfish.on('error', reject);
        stockfish.on('exit', () => {
            if (!bestMove) reject(new Error('Stockfish exited before returning bestmove'));
        });
    });
}

module.exports = {
    analyzePosition,
    getBotMove
};



