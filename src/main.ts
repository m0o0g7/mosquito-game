// src/main.ts
import Phaser from 'phaser';
import GameScene from './scenes/GameScene';  // ← 이 줄이 필요하려면…

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',

  // ↘ 여기! GameScene 을 씬으로 등록해야 import가 쓰입니다.
  scene: [ GameScene ],

  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x:0, y: 0 }
    }
  },
};

new Phaser.Game(config);
