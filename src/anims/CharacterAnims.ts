import Phaser from 'phaser'

export const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrameRate = 15
  const characters = ['nancy', 'lucy', 'ash', 'adam']
  const directions = ['right', 'up', 'left', 'down']

  characters.forEach((char) => {
    // 1. Idle animations
    directions.forEach((dir, i) => {
      anims.create({
        key: `${char}_idle_${dir}`,
        frames: anims.generateFrameNames(char, {
          start: i * 6,
          end: i * 6 + 5,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
      })
    })

    // 2. Run animations
    directions.forEach((dir, i) => {
      anims.create({
        key: `${char}_run_${dir}`,
        frames: anims.generateFrameNames(char, {
          start: 24 + i * 6,
          end: 24 + i * 6 + 5,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
      })
    })

    // 3. Sit animations (down, left, right, up)
    const sitDirs = ['down', 'left', 'right', 'up']
    sitDirs.forEach((dir, i) => {
      anims.create({
        key: `${char}_sit_${dir}`,
        frames: anims.generateFrameNames(char, {
          start: 48 + i,
          end: 48 + i,
        }),
        repeat: 0,
        frameRate: animsFrameRate,
      })
    })
  })
}
