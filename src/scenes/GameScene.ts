// src/scenes/GameScene.ts
import Phaser from 'phaser';
import { getSpawnInterval } from '../utils/spawnLogic';

export default class GameScene extends Phaser.Scene {
  private score = 0;
  private lives = 3;
  private maxLives = 3;
  private gameStarted = false;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private mosquitoGroup!: Phaser.Physics.Arcade.Group;
  private startButton!: Phaser.GameObjects.Text;
  private restartButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'game-scene' });
  }

  preload() {
    this.load.image('mosquito', 'assets/mosquito.png');
  }

  create() {
    // 월드 경계 설정
    this.physics.world.setBounds(0, 0, 800, 600);

    // 모기 그룹 생성
    this.mosquitoGroup = this.physics.add.group({
      defaultKey: 'mosquito',
      maxSize: 50,
      runChildUpdate: false,
    });

    // 점수 텍스트
    this.scoreText = this.add.text(16, 16, '점수: 0', {
      fontSize: '24px',
      color: '#000',
      backgroundColor: '#ffffff80',
      padding: { x: 10, y: 5 },
    });

    // 하트(생명) 텍스트
    this.livesText = this.add.text(16, 48, '', {
      fontSize: '24px',
      color: '#f00',
      backgroundColor: '#ffffff80',
      padding: { x: 10, y: 5 },
    });
    this.updateLivesText();

    // 게임 시작 버튼
    this.startButton = this.add
      .text(400, 300, '게임 시작하기', {
        fontSize: '32px',
        backgroundColor: '#000',
        color: '#fff',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();
    this.startButton.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        this.startButton.setVisible(false);
        this.restartButton.setVisible(false);
        this.gameStarted = true;
        this.score = 0;
        this.lives = this.maxLives;
        this.scoreText.setText('점수: 0');
        this.updateLivesText();
        this.mosquitoGroup.clear(true, true);
        this.physics.resume();
        this.scheduleNextSpawn();
      }
    );

    // 다시 시작 버튼
    this.restartButton = this.add
      .text(400, 300, '다시 시작하기', {
        fontSize: '32px',
        backgroundColor: '#000',
        color: '#fff',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive()
      .setVisible(false);
    this.restartButton.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        this.restartButton.setVisible(false);
        this.startButton.setVisible(false);
        this.gameStarted = true;
        this.score = 0;
        this.lives = this.maxLives;
        this.scoreText.setText('점수: 0');
        this.updateLivesText();
        this.mosquitoGroup.clear(true, true);
        this.physics.resume();
        this.scheduleNextSpawn();
      }
    );

    // 클릭 핸들러
    this.input.on('pointerdown', this.handleClick, this);
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    if (!this.gameStarted) return;

    // 모기 클릭 감지
    const sprites = this.mosquitoGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    const hit = sprites.find((s) =>
      s.active && s.getBounds().contains(pointer.x, pointer.y)
    );

    if (hit) {
      hit.setActive(false).setVisible(false);
      this.score++;
      this.scoreText.setText('점수: ' + this.score);
      this.scheduleNextSpawn();
    } else {
      this.lives--;
      this.updateLivesText();
      if (this.lives <= 0) {
        this.gameStarted = false;
        this.physics.pause();
        this.spawnTimer?.remove();
        this.restartButton.setVisible(true);
      }
    }
  }

  private updateLivesText(): void {
    const fullHearts = '♥'.repeat(this.lives);
    const emptyHearts = '♡'.repeat(this.maxLives - this.lives);
    this.livesText.setText(fullHearts + emptyHearts);
  }

  private scheduleNextSpawn(): void {
    if (!this.gameStarted) return;
    const intervalMs = getSpawnInterval(this.score) * 1000;
    this.spawnTimer?.remove();
    this.spawnTimer = this.time.addEvent({
      delay: intervalMs,
      callback: this.spawnMosquito,
      callbackScope: this,
    });
  }

  private spawnMosquito(): void {
    if (!this.gameStarted) return;
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const m = this.mosquitoGroup.get(x, y) as Phaser.Physics.Arcade.Sprite;
    if (!m) return;

    m
      .setActive(true)
      .setVisible(true)
      .setScale(0.1)
      .setCollideWorldBounds(true)
      .setBounce(1, 1);

    const angle = Phaser.Math.Between(0, 360);
    const speed = Phaser.Math.Between(150, 300);
    const vel = this.physics.velocityFromAngle(angle, speed);
    m.setVelocity(vel.x, vel.y);

    const activeCount = this.mosquitoGroup.countActive(true);
    if (activeCount >= 10) {
      this.gameStarted = false;
      this.physics.pause();
      this.spawnTimer?.remove();
      this.restartButton.setVisible(true);
      return;
    }

    this.scheduleNextSpawn();
  }
}
