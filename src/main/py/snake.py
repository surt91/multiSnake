import pygame
from py4j.java_gateway import JavaGateway


class Snake:
    def __init__(self):
        pygame.init()

        gateway = JavaGateway()
        self.gameState = gateway.entry_point.getGameState()
        gateway.jvm.java.lang.System.out.println('Connected to Python!')

        self.gameState.setPause(False)
        self.idx = self.gameState.addSnake()
        self.snake = self.gameState.getSnakes()[self.idx]

    def seed(self, seed):
        self.gameState.reseed(seed)
        self.reset()

    def reset(self):
        self.gameState.reset()
        self.gameState.setPause(False)
        return self.gameState.trainingState(self.idx)

    def render(self):
        scale = 20
        screen = pygame.display.set_mode((10 * scale, 10 * scale))
        food = self.gameState.getFood()
        pygame.draw.rect(
            screen,
            [230, 20, 20],
            [scale * food.getX(), scale * food.getY(), scale, scale]
        )

        pygame.draw.rect(
            screen,
            [100, 230, 100],
            [scale * self.snake.getHead().getX(), scale * self.snake.getHead().getY(), scale, scale]
        )

        for i in self.snake.getTailAsList():
            pygame.draw.rect(
                screen,
                [100, 230, 100],
                [scale * i.getX(), scale * i.getY(), scale, scale]
            )

        pygame.display.update()

    def step(self, action):
        self.gameState.turnRelative(self.idx, action)
        self.gameState.update()

        state = self.gameState.trainingState(self.idx)

        done = False
        reward = 0
        if self.gameState.isGameOver():
            reward = -1
            done = True
            print("dead")
        elif self.gameState.isEating(self.snake):
            reward = 1
            print("nom")

        return state, reward, done, "idk"

    def state_size(self):
        return 10

    def action_size(self):
        return 3

    def max_reward(self):
        return 300
