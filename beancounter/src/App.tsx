import React, { useEffect, useMemo, useRef, useState } from "react";
import './App.css';


import { useImmer } from "use-immer";
// import { produce } from "immer";

type Player = {
  name: string;
  score: number;
  liable: boolean;
  dups: number;
}

type Game = {
  players: Player[];
}

const makePlayer = (name: string): Player => {
  return {
    name,
    score: 88,
    liable: false,
    dups: 0,
  }
}

function App() {
  const [game, set_game] = useImmer<Game>({
    players: [
      makePlayer("Vincent"),
      makePlayer("Emily"),
      makePlayer("Jules"),
    ]
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
      <header className="App-header">
        {
          game.players.map((player, i) =>
            <div
              key={i}
            >{player.name}: {player.score} <Coin>Pt</Coin>

              <button
                className={"liable" + (player.liable ? " enabled" : " ")}
                onClick={() => set_game((draft) => { draft.players[i].liable = !player.liable })}>Lose
              </button>
              {
                player.liable &&
                <>
                  <button>
                    <Coin>×2</Coin>
                  </button>
                  <button>
                    <Coin>×2</Coin>
                  </button>
                </>
              }
              {
                !!someoneIsLiable &&
                !player.liable &&
                <button
                  className={"pay"}
                  onClick={() => set_game((draft) => {
                    draft.players.forEach(p => {
                          if (p.liable) {
                            p.score -= score;
                            p.liable = false;
                            p.dups = 0;
                          }
                        }
                      )
                    draft.players[i].score += (liables.length * score);
                  })}
                  >
                  Pay
                </button>
              }
            </div>
          )
        }
        <div>---</div>
        <div
          onClick={() => {
            const name = window.prompt("Enter name")
            if (!!name) {
              set_game((draft) => { draft.players.push(makePlayer(name)) })
            }
          }}>Add player+</div>
        <div>---</div>
        <div id="pointinput">
          <button id="rst" onClick={initScore}>↺</button>

          <button id="pp" onClick={() => set_points(points + 1)}>▲</button>
          <div id="vp">{points} <Coin>Pt</Coin></div>
          <button id="mp" onClick={() => set_points(points - 1)} disabled={points < 1}>▼</button>

          <button id="pm" onClick={() => set_dups(dups + 1)}>▲</button>
          <div id="vm">{dups} <Coin>×2</Coin></div>
          <button id="mm" onClick={() => set_dups(dups - 1)} disabled={dups < 1}>▼</button>

          <div id="vs"> = {score} <Coin>Pt</Coin></div>
        </div>
      </header>
    </div>
  );
}

function Coin(props: { children: string }) {
  return (<span className="coin">{props.children}</span>);
}

const calcScore = (points: number, dups: number): number => {
  return points * (2 ** dups);
}

export default App;
