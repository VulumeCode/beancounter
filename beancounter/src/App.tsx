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
  const [mult, set_mult] = useState<number>(1);
  const [gos, set_gos] = useState<number>(0);
  const score = calcScore(points, mult, gos);
  const initScore = () => {
    set_points(0);
    set_mult(1);
    set_gos(0);
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
          <button id="pp" onClick={()=>set_points(points+1)}>▲</button><div id="vp">{points}</div><button id="mp" onClick={()=>set_points(points-1)}>▼</button>
          <button id="pm" onClick={()=>set_mult(mult+1)}>▲</button><div id="vm">×{mult}</div><button id="mm" onClick={()=>set_mult(mult-1)}>▼</button>
          <button id="pg" onClick={()=>set_gos(gos+1)}>▲</button><div id="vg">{gos} 고</div><button id="mg" onClick={()=>set_gos(gos-1)}>▼</button>
          <div id="vs"> = ₩{score}</div>
        </div>
      </header>
    </div>
  );
}

const calcScore = (points: number, mult: number, gos: number): number => {
  switch (gos) {
    case 0:
      break;
    case 1:
      points += 1;
      break;
    default:
      points += 2;
      mult += (gos - 2);
      break;
  }
  return points * mult;
}

export default App;
