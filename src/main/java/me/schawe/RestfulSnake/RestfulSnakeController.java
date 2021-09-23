package me.schawe.RestfulSnake;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
public class RestfulSnakeController {
    private final GameStateMap map;

    RestfulSnakeController(GameStateMap map) {
        this.map = map;
    }

    @PostMapping("/api/init")
    WrapIdAndState init() {
        GameState gameState = new GameState();
        map.put(gameState.id, gameState);

        return new WrapIdAndState(0, gameState);
    }

    @PostMapping("/api/{id}/join")
    WrapIdAndState join(@PathVariable String id) {
        GameState gameState = map.get(id);
        int idx = gameState.addSnake();

        return new WrapIdAndState(idx, gameState);
    }

    @PostMapping("/api/{id}/pause")
    void pause(@PathVariable String id) {
        GameState gameState = map.get(id);
        gameState.setPause(true);
    }

    @PostMapping("/api/{id}/unpause")
    void unpause(@PathVariable String id) {
        GameState gameState = map.get(id);
        gameState.setPause(false);
    }

    // We use just an index to identify the snake. This makes it very easy to cheat.
    @PostMapping("/api/{id}/{idx}/move/{move}")
    GameState move_step(@PathVariable String id, @PathVariable int idx, @PathVariable Move move) {
        GameState gameState = map.get(id);
        gameState.turn(idx, move);

        return gameState;
    }
}
