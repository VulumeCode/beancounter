import React, { useEffect, useState } from 'react'
import './App.css'

import bean from './bean.svg'
import { useImmer } from 'use-immer'
import Modal from './components/Modal/Modal'

interface Player {
  name: string
  score: number
  liable: boolean
  dups: number
}

interface Game {
  players: Player[]
  undos: Player[][]
  redos: Player[][]
  par_score: number

  contrast: boolean
}

const makePlayer = (name: string): Player => {
  return {
    name,
    score: 0,
    liable: false,
    dups: 0
  }
}

function App (): JSX.Element {
  const localStorageKey = 'beancounter-game'
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const [game, setGame] = useImmer<Game>(() => {
    const localStorageValue = localStorage.getItem(localStorageKey)
    if (localStorageValue == null) {
      setIsMenuOpen(true)
      return {
        players: [
          makePlayer(''),
          makePlayer(''),
          makePlayer(''),
          makePlayer(''),
          makePlayer(''),
          makePlayer(''),
          makePlayer('')
        ],
        undos: [],
        redos: [],
        par_score: 88,
        contrast: true
      }
    } else {
      const localStorageGame = JSON.parse(localStorageValue)
      if (localStorageGame != null) {
        console.log(localStorageGame.players[0].name)
        return localStorageGame
      }
    }
  }
  )

  useEffect(() => {
    console.log('set')
    localStorage.setItem(localStorageKey, JSON.stringify(game))
  }, [game])

  const undo = (): void => {
    setGame((draft) => {
      const h = draft.undos.pop()
      if (h) {
        draft.redos.push(game.players)
        draft.players = h
      }
    })
  }
  const redo = (): void => {
    setGame((draft) => {
      const h = draft.redos.pop()
      if (h) {
        draft.undos.push(game.players)
        draft.players = h
      }
    })
  }

  const [points, setPoints] = useState<number>(0)
  const [dups, setDups] = useState<number>(0)
  const initScore = (): void => {
    setPoints(0)
    setDups(0)
  }

  const players = Object.values(game.players)
  const score = calcScore(points, dups)
  const liables = players.filter(p => p.liable)
  const someoneIsLiable = liables.length > 0

  return (
    <div className={'App' + (game.contrast ? ' contrast' : ' ')}>
      <div id="backgroundNoise">
        <div id="backgroundColor">
        </div>
      </div>
      <div className="beancounter">
        <div className="menu">

          <button
            onClick={() => { setIsMenuOpen(true) }} style={{ gridArea: 'open' }}>☰</button>
          <button onClick={undo} style={{ gridArea: 'undo' }} disabled={game.undos.length === 0}>↩</button>
          <button onClick={redo} style={{ gridArea: 'redo' }} disabled={game.redos.length === 0}>↪</button>
        </div>
        <div className="players">
          {
            players.map((player, i) =>
              !!player.name &&
              <div className="player"
                key={'player' + i}
              >
                <div className="name">{player.name}</div>
                <div className="points">: {game.par_score + player.score} <CoinPoints /></div>
                <div
                  style={{ gridArea: 'b1' }}>
                  <button
                    className={'liable' + (player.liable ? ' enabled' : ' ')}
                    onClick={() => { setGame((draft) => { draft.players[i].liable = !player.liable }) }}>Loss
                  </button>
                </div>
                {
                  player.liable &&
                  <div style={{ gridArea: 'b2' }} className="liable_mult">
                    <div
                      className={'liable_mult x2_1' + (player.dups > 0 ? ' enabled' : ' disabled')}
                      style={{ gridArea: 'b2' }}
                      onClick={() => {
                        setGame((draft) => {
                          if (player.dups === 0) {
                            draft.players[i].dups++
                          } else {
                            draft.players[i].dups--
                          }
                        })
                      }}>
                      <CoinDups />
                    </div>
                    <div
                      className={'liable_mult x2_2' + (player.dups > 1 ? ' enabled' : ' disabled')}
                      style={{ gridArea: 'b3' }}
                      onClick={() => {
                        setGame((draft) => {
                          if (player.dups <= 1) {
                            draft.players[i].dups = 2
                          } else {
                            draft.players[i].dups--
                          }
                        })
                      }}>
                      <CoinDups />
                    </div>
                  </div>
                }
                {
                  !!someoneIsLiable &&
                  !player.liable &&
                  <div
                    style={{ gridArea: 'b2' }}><button
                      className={'pay'}
                      onClick={() => {
                        setGame((draft) => {
                          draft.undos.push(game.players)
                          draft.redos = []
                          let gain = 0
                          draft.players.forEach(p => {
                            if (!!p.name && p.liable) {
                              const loss = score * (2 ** p.dups)
                              gain += loss
                              p.score -= loss
                              p.liable = false
                              p.dups = 0
                            }
                          }
                          )
                          draft.players[i].score += gain
                        })
                      }}
                    >
                      Pay
                    </button></div>
                }
              </div>
            )
          }
        </div>

        <div id="pointinput">
          <button id="rst" onClick={initScore}>↺</button>

          <button id="pp" onClick={() => { setPoints(points + 1) }}>▲</button>
          <div id="vp">{points} <CoinPoints /></div>
          <button id="mp" onClick={() => { setPoints(points - 1) }} disabled={points < 1}>▼</button>

          <button id="pm" onClick={() => { setDups(dups + 1) }}>▲</button>
          <div id="vm">{dups} <CoinDups /></div>
          <button id="mm" onClick={() => { setDups(dups - 1) }} disabled={dups < 1}>▼</button>

          <div id="vs"> = {score} <CoinPoints /></div>
        </div>
      </div>
      <Modal
        isOpen={isMenuOpen}
        hasCloseBtn={true}
        onClose={() => { setIsMenuOpen(false) }}>
        <div id="modalMenu">
          <label htmlFor="par_score">Par score: </label>
          <select name="par_score" value={game.par_score} onChange={(e) => { setGame((draft) => { draft.par_score = parseInt(e.target.value) }) }}>
            <option>0</option>
            <option>88</option>
            <option>100</option>
          </select><br />
          <br />
          <button onClick={() => {
            window.confirm('New game?') && setGame((draft) => {
              draft.redos = []
              draft.undos = []
              draft.players.forEach((p) => {
                p.dups = 0
                p.liable = false
                p.score = 0
              })
            })
          }}>New game</button><br />
          <br />
          <form id="player_names">
            <label>Player names</label><br />
            {
              game.players.map((p, i) => <div key={'player_name_' + i} >
                <input type="text" id={'player_name_' + i} value={p.name}
                  onChange={(event) => { setGame((draft) => { draft.players[i].name = event.target.value }) }}></input><br />
              </div>)
            }
          </form>
          <br />
          <label htmlFor='contrast'>High contrast: </label>
          <input type="checkbox" name='contast' checked={game.contrast} onChange={(e) => {
            console.log(e.target.checked)
            setGame((draft) => { draft.contrast = e.target.checked })
          }} />
        </div>
      </Modal>
    </div>
  )
}

const CoinPoints = (): JSX.Element => <Coin><img src={bean} alt="" className="bean" /></Coin>
const CoinDups = (): JSX.Element => <Coin>×2</Coin>

function Coin (props: { children: any }): JSX.Element {
  return (<span className="coin">{props.children}</span>)
}

const calcScore = (points: number, dups: number): number => {
  return points * (2 ** dups)
}

export default App
