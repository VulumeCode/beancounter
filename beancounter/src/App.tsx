import React, { useState } from "react";
import './App.css';


import { useImmer } from "use-immer";

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



const icons = [
  "https://fudawiki.org/hanafuda/icons/monthicon_1.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_2.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_3.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_4.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_5.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_6.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_7.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_8.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_9.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_10.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_11.png",
  "https://fudawiki.org/hanafuda/icons/monthicon_12.png",
]


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
      makePlayer("AAA"),
      makePlayer("BBB"),
      makePlayer("CCC"),
    ],
    undos: [],
    redos: [],
    par_score: 88,
  });

  const [points, set_points] = useState<number>(0);
  const [dups, set_dups] = useState<number>(0);
  const initScore = () => {
    set_points(0);
    set_dups(0);
  }

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

  const score = calcScore(points, dups);
  const liables = game.players.filter(p => p.liable);
  const someoneIsLiable = liables.length > 0;

  return (
    <div className="App">
      <div id="backgroundNoise">
        <div id="backgroundColor">
        </div>
      </div>
      <header className="App-header">
        <div className="menu">

          <button
            onClick={undo}>↩</button>
          <button
            onClick={() => {
              const name = window.prompt("Enter name")
              if (!!name) {
                set_game((draft) => { draft.players.push(makePlayer(name)) })
              }
            }}>☰</button>
          <button
            onClick={redo}>↪</button>
        </div>
        <div className="players">
          {
            game.players.map((player, i) =>
              <div className="player"
                key={i}
              >
                {/* <div className="name">{player.name}: </div> */}
                <img alt="" className="icon" src={icons[i%12]}/>
                <div className="points">{game.par_score + player.score} <CoinPoints /></div>
                <div><button
                  className={"liable" + (player.liable ? " enabled" : " ")}
                  onClick={() => set_game((draft) => { draft.players[i].liable = !player.liable })}>Lose
                </button></div>

                {
                  player.liable &&
                  <>
                    <button
                      className={"liable_mult x2_1" + (player.dups > 0 ? " enabled" : " ")}
                      onClick={() => set_game((draft) => {
                        if (player.dups === 0) {
                          draft.players[i].dups++;
                        } else {
                          draft.players[i].dups--;
                        }
                      })}>
                      <CoinDups />
                    </button>
                    <button
                      className={"liable_mult x2_2" + (player.dups > 1 ? " enabled" : " ")}
                      onClick={() => set_game((draft) => {
                        if (player.dups <= 1) {
                          draft.players[i].dups++;
                        } else {
                          draft.players[i].dups--;
                        }
                      })}>
                      <CoinDups />
                    </button>
                  </>
                }
                {
                  !!someoneIsLiable &&
                  !player.liable &&
                  <button
                    className={"pay"}
                    onClick={() => set_game((draft) => {
                      draft.undos.push(game.players);
                      draft.redos = [];
                      let gain = 0;
                      draft.players.forEach(p => {
                        if (p.liable) {
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
                  </button>
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
      </header>
    </div>
  );
}

const CoinPoints = () => <Coin>§</Coin>
const CoinDups = () => <Coin>×2</Coin>


function Coin(props: { children: string }) {
  return (<span className="coin">{props.children}</span>);
}

const calcScore = (points: number, dups: number): number => {
  return points * (2 ** dups);
}

export default App;
