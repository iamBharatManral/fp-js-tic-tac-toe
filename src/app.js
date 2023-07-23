import {all, always, any, cond, equals, ifElse, map, pipe} from "ramda";
import { Fireworks } from 'fireworks-js'

const players = {
    Player1: Symbol(1),
    Player2: Symbol(2)
}

const winningCombos = [[1, 2, 3], [4, 5, 6], [7,8,9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]]

const playerMarks = {
    [players.Player1]: () => "X",
    [players.Player2]: () => "O"
}

const board = {
    1: {
        row: 1,
        col: 1,
        player: null
    },
    2: {
        row: 1,
        col: 2,
        player: null
    },
    3: {
        row: 1,
        col: 3,
        player: null
    },
    4: {
        row: 2,
        col: 1,
        player: null
    },
    5: {
        row: 2,
        col: 2,
        player: null
    },
    6: {
        row: 2,
        col: 3,
        player: null
    },
    7: {
        row: 3,
        col: 1,
        player: null
    },
    8: {
        row: 3,
        col: 2,
        player: null
    },
    9: {
        row: 3,
        col: 3,
        player: null
    }
}

const initialState = {
    board,
    currentPlayer: null,
    currentCell: null
}

const outcomes = {
    win: Symbol(1),
    draw: Symbol(2),
    continue: Symbol(3)
}

const getPlayerMark = player => playerMarks[player]()

const isLeftPlayerSame = ({currentCell: cell, board, currentPlayer: player}) => {
    return [3, 6, 9].includes(cell)
        ? board[cell-1]["player"] === player && board[cell-2]["player"] === player
        : [2, 5, 8].includes(cell)
            ? board[cell-1]["player"] === player
            : true
}

const isRightPlayerSame = ({currentCell: cell, board, currentPlayer: player}) => {
    return [1, 4, 7].includes(cell)
        ? board[cell+1]["player"] === player && board[cell+2]["player"] === player
        : [2, 5, 8].includes(cell)
            ? board[cell+1]["player"] === player
            : true
}

const isUpPlayerSame = ({currentCell: cell, board, currentPlayer: player}) => {
    return [7, 8, 9].includes(cell)
        ? board[cell-3]["player"] === player && board[cell-6]["player"] === player
        : [4, 5, 6].includes(cell)
            ? board[cell-3]["player"] === player
            : true
}

const isDownPlayerSame = ({currentCell: cell, board, currentPlayer: player}) => {
    return [1, 2, 3].includes(cell)
        ? board[cell+3]["player"] === player && board[cell+6]["player"] === player
        : [4, 5, 6].includes(cell)
            ? board[cell+3]["player"] === player
            : true
}

const checkRow = state => all(equals(true), [isLeftPlayerSame(state), isRightPlayerSame(state)])

const checkCol = state => all(equals(true), [isUpPlayerSame(state), isDownPlayerSame(state)])

const checkDiagonal = state => {
    const {board, currentPlayer: player, currentCell: cell} = state
    return cond([
        [(b, cell) => [2, 4, 6, 8].includes(cell), always(false)],
        [(b, cell) => cell === 1, (board, cell, player) => (board[cell + 4]["player"] === player && board[cell + 8]["player"] === player)],
        [(b, cell) => cell === 3, (board, cell, player) => (board[cell + 2]["player"] === player && board[cell + 4]["player"] === player)],
        [(b, cell) => cell === 5, (board, cell, player) => (board[cell - 2]["player"] === player && board[cell + 2]["player"] === player)
            || (board[cell - 4]["player"] === player && board[cell + 4]["player"] === player)],
        [(b, cell) => cell === 7, (board, cell, player) => (board[cell - 2]["player"] === player && board[cell - 4]["player"] === player)],
        [(b, cell) => cell === 9, (board, cell, player) => (board[cell - 4]["player"] === player && board[cell - 8]["player"] === player)
        ],
    ])(board, cell, player)
}

const isBoardFull = state => all(equals(true), Object.values(map(cell => !!cell.player, state.board)))

const continueOrDrawGame = state => isBoardFull(state) ? {outcome: outcomes.draw, state} : {outcome: outcomes.continue, state}

const finishGame = (state) => ({outcome: outcomes.win, state})

const getCurrentPlayer = lastPlayer => cond([
        [equals(null), always(players.Player1)],
        [equals(players.Player1), always(players.Player2)],
        [equals(players.Player2), always(players.Player1)]
        ])(lastPlayer)


const haveWon = (state) => any(equals(true), [checkRow(state), checkCol(state), checkDiagonal(state)])

const decideOutcome = ifElse(haveWon, finishGame, continueOrDrawGame)

const updateBoard = (state, cell) => {
    const {board, currentPlayer: player} = state;
    const currentPlayer = getCurrentPlayer(player)
    if(board[cell]["player"] !== null){
        return state
    }
    return {
        board: {
        ...board,
                [cell]: {
            ...board[cell],
                    player: !board[cell][player] ? currentPlayer: board[cell][player]
            }
        },
        currentCell: parseInt(cell),
        currentPlayer: currentPlayer
    }
}

const playGame = pipe(updateBoard, decideOutcome)

const app = () => {
    const board = document.querySelector(".board")
    const firework = document.querySelector(".firework")
    const fireworks = new Fireworks(firework, { /* options */ })
    const newBtn = document.querySelector(".new")
    const cells = document.getElementsByClassName("cell")
    const message = document.querySelector(".message")
    const playerTurn = document.querySelector(".playerTurn")
    let state = initialState

    const clearState = () => {
        state = initialState
    }
    const clearBoard = () => Array.from(cells).forEach(cell => {
        cell.innerText = ""
    })

    const markWinOnUI = () => {
        let winningCells;
        const player1Cells = Object.keys(state.board).filter(
            key => state["board"][key]["player"] === players.Player1
            ).sort()
        const player2Cells = Object.keys(state.board).filter(
            key => state["board"][key]["player"] === players.Player2
        ).sort()
        winningCombos.forEach(combo => {
                if (combo.every(item => player1Cells.includes(item.toString()))) {
                    winningCells = combo
                } else if (combo.every(item => player2Cells.includes(item.toString()))) {
                    winningCells = combo
                }
            }
        )

        winningCells.forEach(cell => {
            console.log(cell)
            cells[cell-1].style.textDecoration = "line-through"
        })
    }

    const freezeBoard = () => Array.from(cells).forEach(cell =>{
        cell.style.pointerEvents = "none"
    })

    const unfreezeBoard = () => Array.from(cells).forEach(cell =>{
        cell.style.pointerEvents = "auto"
    })


    const clearMessage = () => message.innerText = ""

    const setMessage = (gameState, playerMark) => {
        if(gameState === "win"){
            message.innerText = playerMark === "X" ? "Whoopie! Player 1 has Won!" : "Whoopie! Player 2 has Won!"
            message.style.color = "darkgreen"
        }else{
            message.innerText = "Oops! This game is a Draw!"
            message.style.color = "red"
        }
    }
    const markPlayerOnUI = () => {
        const element = cells[state.currentCell-1]
        const playerMark = getPlayerMark(state.currentPlayer)
        element.innerText = playerMark
        element.style.color = playerMark === "X" ? "whitesmoke" : "yellow"
    }

    const setPlayerTurn = playerMark => {
        const player = playerMark  === "X" ? "O" : "X"
        playerTurn.innerText = `It's ${player}'s turn!`
    }
    const clearPlayerTurn = () =>{
        playerTurn.innerText = ""
    }
    const setPressedEffect = (cell) => {
        cells[cell-1].style.scale = "0.98";
        cells[cell-1].style.boxShadow = "0 0 3px 3px lightgray"
    }
    const handleInput = (event) => {
        const cellNumber = event.target.classList[1].split("-")[1]
        setPressedEffect(cellNumber)
        const {outcome, state: newState } = playGame(state, cellNumber)
        state = newState
        setPlayerTurn(getPlayerMark(state.currentPlayer))
        if(outcome === outcomes.win){
            clearPlayerTurn()
            markPlayerOnUI()
            markWinOnUI()
            setMessage("win", getPlayerMark(state.currentPlayer))
            freezeBoard()
            fireworks.start()
            setTimeout(() => {
                fireworks.pause()
                fireworks.clear()
            }, 5000)
        }else if(outcome=== outcomes.draw){
            clearPlayerTurn()
            markPlayerOnUI()
            setMessage("draw", getPlayerMark(state.currentPlayer))
            freezeBoard()
        }else{
            setPlayerTurn(getPlayerMark(state.currentPlayer))
            markPlayerOnUI()
        }
    }

    Array.from(cells).forEach(
        cell => cell.addEventListener('click', handleInput)
    )

    const newGame = pipe(clearBoard, clearState, clearMessage, unfreezeBoard, clearPlayerTurn)

    newBtn.addEventListener('click', newGame)
}

app()
