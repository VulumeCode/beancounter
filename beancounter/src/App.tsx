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
      makePlayer("AAA"),
      makePlayer("BBB"),
      makePlayer("CCC"),
    ],
    par_score: 88,
  });

  const [points, set_points] = useState<number>(0);
  const [dups, set_dups] = useState<number>(0);
  const initScore = () => {
    set_points(0);
    set_dups(0);
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

          <div
            onClick={() => {
              const name = window.prompt("Enter name")
              if (!!name) {
                set_game((draft) => { draft.players.push(makePlayer(name)) })
              }
            }}>↩</div>          
          <div
            onClick={() => {
              const name = window.prompt("Enter name")
              if (!!name) {
                set_game((draft) => { draft.players.push(makePlayer(name)) })
              }
            }}>☰</div>          
          <div
            onClick={() => {
              const name = window.prompt("Enter name")
              if (!!name) {
                set_game((draft) => { draft.players.push(makePlayer(name)) })
              }
            }}>↪</div>
        </div>
        <div className="players">
        {
          game.players.map((player, i) =>
            <div className="player"
              key={i}
            ><div className="name">{player.name}: </div>
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
                    <CoinDups/>
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
                    <CoinDups/>
                  </button>
                </>
              }
              {
                !!someoneIsLiable &&
                !player.liable &&
                <button
                  className={"pay"}
                  onClick={() => set_game((draft) => {
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
          <div id="vp">{points} <CoinPoints/></div>
          <button id="mp" onClick={() => set_points(points - 1)} disabled={points < 1}>▼</button>

          <button id="pm" onClick={() => set_dups(dups + 1)}>▲</button>
          <div id="vm">{dups} <CoinDups/></div>
          <button id="mm" onClick={() => set_dups(dups - 1)} disabled={dups < 1}>▼</button>

          <div id="vs"> = {score} <CoinPoints/></div>
        </div>
      </header>
    </div>
  );
}

const  CoinPoints = () => <Coin>§</Coin>
const  CoinDups = () => <Coin>×2</Coin>


function Coin(props: { children: string }) {
  return (<span className="coin">{props.children}</span>);
}

const calcScore = (points: number, dups: number): number => {
  return points * (2 ** dups);
}

export default App;
