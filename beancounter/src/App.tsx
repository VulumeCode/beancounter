import { useState } from "react";
import './App.css';

import bean from './bean.svg'
import { useImmer } from "use-immer";
import Modal from "./components/Modal/Modal";

type Player = {
  name: string;
  score: number;
  liable: boolean;
  dups: number;
}

type Game = {
  players: Player[];
  undos: Player[][];
  redos: Player[][];
  par_score: number;
}

const makePlayer = (name: string): Player => {
  return {
    name,
    score: 0,
    liable: false,
    dups: 0,
  }
}

function App() {
  const [game, set_game] = useImmer<Game>({
    players: [
      makePlayer("Alice"),
      makePlayer("Bob"),
      makePlayer("Charlie"),
      makePlayer(""),
      makePlayer(""),
      makePlayer(""),
      makePlayer(""),
    ],
    undos: [],
    redos: [],
    par_score: 88,
  });

  const undo = () => {
    set_game((draft) => {
      const h = draft.undos.pop();
      if (!!h) {
        draft.redos.push(game.players);
        draft.players = h;
      }
    })
  }
  const redo = () => {
    set_game((draft) => {
      const h = draft.redos.pop();
      if (!!h) {
        draft.undos.push(game.players);
        draft.players = h;
      }
    })
  }

  const [points, set_points] = useState<number>(0);
  const [dups, set_dups] = useState<number>(0);
  const initScore = () => {
    set_points(0);
    set_dups(0);
  }

  const players = Object.values(game.players);
  const score = calcScore(points, dups);
  const liables = players.filter(p => p.liable);
  const someoneIsLiable = liables.length > 0;

  const [isMenuOpen, set_isMenuOpen] = useState<boolean>(false);


  return (
    <div className="App">
      <div id="backgroundNoise">
        <div id="backgroundColor">
        </div>
      </div>
      <div className="beancounter">
        <div className="menu">

          <button
            onClick={() => set_isMenuOpen(true)} style={{ gridArea: "open" }}>☰</button>
          <button onClick={undo} style={{ gridArea: "undo" }} disabled={!game.undos.length}>↩</button>
          <button onClick={redo} style={{ gridArea: "redo" }} disabled={!game.redos.length}>↪</button>
        </div>
        <div className="players">
          {
            players.map((player, i) =>
              !!player.name &&
              <div className="player"
                key={i}
              >
                <div className="name">{player.name}</div>
                <div className="points">: {game.par_score + player.score} <CoinPoints /></div>
                <div
                  style={{ gridArea: "b1" }}>
                  <button
                    className={"liable" + (player.liable ? " enabled" : " ")}
                    onClick={() => set_game((draft) => { draft.players[i].liable = !player.liable })}>Loss
                  </button>
                </div>
                {
                  player.liable &&
                  <div style={{ gridArea: "b2" }} className="liable_mult">
                    <div
                      className={"liable_mult x2_1" + (player.dups > 0 ? " enabled" : " disabled")}
                      style={{ gridArea: "b2" }}
                      onClick={() => set_game((draft) => {
                        if (player.dups === 0) {
                          draft.players[i].dups++;
                        } else {
                          draft.players[i].dups--;
                        }
                      })}>
                      <CoinDups />
                    </div>
                    <div
                      className={"liable_mult x2_2" + (player.dups > 1 ? " enabled" : " disabled")}
                      style={{ gridArea: "b3" }}
                      onClick={() => set_game((draft) => {
                        if (player.dups <= 1) {
                          draft.players[i].dups = 2;
                        } else {
                          draft.players[i].dups--;
                        }
                      })}>
                      <CoinDups />
                    </div>
                  </div>
                }
                {
                  !!someoneIsLiable &&
                  !player.liable &&
                  <div
                    style={{ gridArea: "b2" }}><button
                      className={"pay"}
                      onClick={() => set_game((draft) => {
                        draft.undos.push(game.players);
                        draft.redos = [];
                        let gain = 0;
                        draft.players.forEach(p => {
                          if (!!p.name && p.liable) {
                            const loss = score * (2 ** p.dups);
                            gain += loss;
                            p.score -= loss;
                            p.liable = false;
                            p.dups = 0;
                          }
                        }
                        )
                        draft.players[i].score += gain;
                      })}
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

          <button id="pp" onClick={() => set_points(points + 1)}>▲</button>
          <div id="vp">{points} <CoinPoints /></div>
          <button id="mp" onClick={() => set_points(points - 1)} disabled={points < 1}>▼</button>

          <button id="pm" onClick={() => set_dups(dups + 1)}>▲</button>
          <div id="vm">{dups} <CoinDups /></div>
          <button id="mm" onClick={() => set_dups(dups - 1)} disabled={dups < 1}>▼</button>

          <div id="vs"> = {score} <CoinPoints /></div>
        </div>
      </div>
      <Modal
        isOpen={isMenuOpen}
        hasCloseBtn={true}
        onClose={() => set_isMenuOpen(false)}>
        <div id="modalMenu">
          <label htmlFor="par_score">Par score: </label>
          <select name="par_score" value={game.par_score} onChange={(e) => set_game((draft) => { draft.par_score = parseInt(e.target.value) })}>
            <option>0</option>
            <option>88</option>
            <option>100</option>
          </select><br />
          <br />
          <button onClick={() => window.confirm("New game?") && set_game((draft) => {
            draft.redos = [];
            draft.undos = [];
            draft.players.forEach((p) => {
              p.dups = 0;
              p.liable = false;
              p.score = 0;
            })
          })}>New game</button><br />
          <br />
          <form id="player_names">
            <label>Player names</label><br />
            {
              game.players.map((p, i) => <>
                <input type="text" key={i} id={"player_name_" + i} value={p.name}
                  onChange={(event) => set_game((draft) => { draft.players[i].name = event.target.value })}></input><br />
              </>)
            }
          </form>
        </div>
      </Modal>
    </div>
  );
}

const CoinPoints = () => <Coin><img src={bean} alt="" className="bean" /></Coin>
const CoinDups = () => <Coin>×2</Coin>


function Coin(props: { children: any }) {
  return (<span className="coin">{props.children}</span>);
}

const calcScore = (points: number, dups: number): number => {
  return points * (2 ** dups);
}

export default App;
