import numpy as np
import pygame_sdl2 as pygame
from py4j.java_gateway import JavaGateway


class Snake:
    def __init__(self, vis):
        self.vis = vis
        if vis:
            pygame.init()

        gateway = JavaGateway()
        self.gameState = gateway.entry_point.getGameState()
        gateway.jvm.java.lang.System.out.println('Connected to Python!')

        self.gameState.setPause(False)
        self.idx = self.gameState.addSnake()
        self.snake = self.gameState.getSnakes()[self.idx]
        self.state = []

    def seed(self, seed):
        self.gameState.reseed(seed)
        self.reset()

    def reset(self):
        self.gameState.reset()
        self.gameState.setPause(False)

        return self.gameState.trainingState(self.idx)

    def render(self):
        if not self.vis:
            return
        scale = 20
        screen = pygame.display.set_mode((10 * scale, 10 * scale))

        pygame.draw.rect(
            screen,
            [0, 0, 0],
            [0, 0, 10 * scale, 10 * scale]
        )

        food = self.gameState.getFood()
        pygame.draw.rect(
            screen,
            [230, 20, 20],
            [scale * food.getX(), scale * food.getY(), scale, scale]
        )

        pygame.draw.rect(
            screen,
            [140, 230, 140],
            [scale * self.snake.getHead().getX(), scale * self.snake.getHead().getY(), scale, scale]
        )

        for i in self.snake.getTailAsList():
            pygame.draw.rect(
                screen,
                [80, 230, 80],
                [scale * i.getX(), scale * i.getY(), scale, scale]
            )

        pygame.display.update()

    def step(self, action):
        self.gameState.turnRelative(self.idx, action)
        self.gameState.update()

        state = self.gameState.trainingState(self.idx)
        self.state = state

        #print(self.snake.getHeadDirection())
        #print(self.snake.getHead().getX(), self.snake.getHead().getY())
        #print(self.gameState.getFood().getX(), self.gameState.getFood().getY())

        done = False
        reward = 0
        if self.gameState.isGameOver():
            reward = -1
            done = True
            if self.vis:
                print("dead")
        elif self.gameState.isEating(self.snake):
            reward = 1
            if self.vis:
                print("nom")

        return state, reward, done, "idk"

    def state_size(self):
        return len(self.gameState.trainingState(self.idx))

    def action_size(self):
        return 3

    def max_reward(self):
        return 150
