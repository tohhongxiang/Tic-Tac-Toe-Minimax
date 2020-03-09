import React, { useState } from 'react'

const SYMBOLS = ['X', 'O']

const generateBoard = (size) => {
    let _size = parseInt(size)
    let board = [];
    for (let i = 0; i < _size; i++) {
        board.push(Array(_size).fill(''))
    }

    return board;
}

const scores = {
    O: 1,
    X: -1,
    'Nobody': 0
}

const minimax = (board, depth, isMaximising) => {
    let winner = checkWinner(board)

    if (winner !== null) {
        return scores[winner] / depth
    }

    if (depth > 2) {
        return 0
    }

    if (isMaximising) {
        let bestScore = -Infinity
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                if (board[i][j] === '') {
                    board[i][j] = 'O'
                    let score = minimax(board, depth + 1, false)
                    board[i][j] = '';

                    bestScore = Math.max(bestScore, score)
                }
            }
        }

        return bestScore;
    } else {
        let bestScore = Infinity
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                if (board[i][j] === '') {
                    board[i][j] = 'X'
                    let score = minimax(board, depth + 1, true)
                    board[i][j] = '';

                    bestScore = Math.min(score, bestScore)
                }
            }
        }
        return bestScore;
    }
}

const checkWinner = (board) => {
    // rows
    for (let i = 0; i < board.length; i++) {
        if (board[i].every(elem => elem === board[i][0] && elem !== '')) {
            return board[i][0]
        }
    }

    // col
    for (let i = 0; i < board[0].length; i++) {
        let cols = []
        for (let j = 0; j < board.length; j++) {
            cols.push(board[j][i])
        }

        if (cols.every(elem => elem === cols[0] && elem !== '')) {
            return cols[0]
        }
    }

    const diagonal1 = []
    for (let i = 0; i < board.length; i++) {
        diagonal1.push(board[i][i])
    }

    if (diagonal1.every(e => e === diagonal1[0] && e !== '')) {
        return diagonal1[0]
    }

    const diagonal2 = []
    for (let i = 0; i < board.length; i++) {
        diagonal2.push(board[i][board.length - 1 - i])
    }

    if (diagonal2.every(e => e === diagonal2[0] && e !== '')) {
        return diagonal2[0]
    }

    // full board
    const spots = board.flat()
    if (spots.every(spot => spot !== '')) {
        return 'Nobody'
    }

    return null
}

export default function Board() {
    const [boardSize, setBoardSize] = useState(3)
    const [board, setBoard] = useState(generateBoard(boardSize))

    const [turn, setTurn] = useState(0)
    const [winner, setWinner] = useState(null);

    const playTurn = (i, j, turn, board) => () => {
        const currentPlayer = SYMBOLS[turn % 2]
        if (winner) {
            return false
        }

        const boardCopy = [...board.map(row => row)]

        if (boardCopy[i][j] !== '') {
            return false
        }

        boardCopy[i][j] = currentPlayer
        setTurn(turn => turn = turn + 1)
        const _winner = checkWinner(boardCopy);

        setBoard(boardCopy)

        if (!_winner) {
            setTimeout(() => {
                playComputerTurn(turn + 1, board)

            }, 100)
        } else {
            setWinner(_winner)
        }

        return true
    }

    const playComputerTurn = (turn, board) => {
        let bestScore = -Infinity;
        let bestMove;
        const currentPlayer = SYMBOLS[turn % 2]
        const boardCopy = [...board.map(b => [...b])]

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === '') {
                    boardCopy[i][j] = 'O';
                    let score = minimax(boardCopy, 0, false);
                    boardCopy[i][j] = ''
                    if (score >= bestScore) {
                        bestScore = score;
                        bestMove = { i, j }
                    }
                }
            }
        }

        if (!bestMove) {
            return
        }

        const { i, j } = bestMove;

        boardCopy[i][j] = currentPlayer;

        setTurn(turn => turn = turn + 1)
        setBoard(boardCopy)

        const _winner = checkWinner(boardCopy)
        if (_winner) {
            setWinner(_winner)
        }
    }

    const resetGame = () => {
        setBoard(generateBoard(boardSize))
        setWinner(null);
        setTurn(0)
    }

    const displayBoard = (board) => {
        return (
            <div className="board">
                {
                    board.map((row, i) => {
                        return (
                            <div className="row" key={i}>
                                {row.map((column, j) => <div key={j} className="cell" onClick={playTurn(i, j, turn, board)}>{column}</div>)}
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    return (
        <div className="container">
            {winner ? <p>{winner} wins</p> : null}
            {displayBoard(board)}
            {!winner ? <p>Current player: {SYMBOLS[turn % SYMBOLS.length]}</p> : null}
            <input type="number" value={boardSize} onChange={e => setBoardSize(e.target.value)} />
            <button onClick={resetGame}>Reset game</button>
        </div>
    )
}
