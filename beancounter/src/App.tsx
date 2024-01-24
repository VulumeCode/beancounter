import React, { useEffect, useMemo, useRef, useState } from "react";
import './App.css';


import { useImmer } from "use-immer";
// import { produce } from "immer";

type Player = {
  name: string;
  score: number;
}

type Game = {
  players: Player[];
}



function App() {
  const [game, set_game] = useImmer<Game>({
    players: [
      { name: "Vincent", score: 88 },
      { name: "Emily", score: 88 },
      { name: "Jules", score: 88 },
    ]
  });
  
  const [points, set_points] = useState<number>(0);
  const [dups, set_dups] = useState<number>(0);
  const score = calcScore(points, dups);
  const initScore = () => {
    set_points(0);
    set_dups(0);
  }


  return (
    <div className="App">
      <header className="App-header">
        {
          game.players.map((player, i) => 
            <div
              key={i}
              >{player.name}: ₩{player.score}</div>
            )
        }
        <div
              onClick={() =>{
                const name = window.prompt("Enter name")
                if (!!name) {
                  set_game((draft)=>{draft.players.push({name:name,score:88})})
                }
          }}>Add player+</div>
        <div>---</div>
        <div id="pointinput">
          <button id="rst" onClick={initScore}>↺</button>
          
          <button id="pp" onClick={() => set_points(points + 1)}>▲</button>
          <div id="vp">{points} <span className="coin">Pt</span></div>
          <button id="mp" onClick={() => set_points(points - 1)}>▼</button>
          
          <button id="pm" onClick={() => set_dups(dups + 1)}>▲</button>
          <div id="vm">{dups} <span className="coin">×2</span></div>
          <button id="mm" onClick={() => set_dups(dups - 1)}>▼</button>
          
          <div id="vs"> = {score} <span className="coin">Pt</span></div>
        </div>
      </header>
    </div>
  );
}

const calcScore = (points: number, dups: number): number => {
  return points * (2**dups);
}

export default App;
