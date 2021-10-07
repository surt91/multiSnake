package me.schawe.multijsnake;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Move;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

@RestController
public class MultiJSnakeController {
    private final GameStateMap map;

    MultiJSnakeController(GameStateMap map, WebSocketService webSocketService) {
        this.map = map;
    }

    @PostMapping("/api/init/{w}/{h}/{seed}")
    GameState init(@PathVariable int w, @PathVariable int h, @PathVariable long seed) {
        return map.newSeededGameState(w, h, seed);
    }

    @PostMapping("/api/init/{w}/{h}")
    GameState init(@PathVariable int w, @PathVariable int h) {
        return map.newGameState(w, h);
    }

    @PostMapping("/api/init")
    GameState init() {
        return init(10, 10);
    }

    @MessageMapping("/pause")
    void pause(@Header("simpSessionId") String sessionId) {
        map.pause(sessionId);
    }

    @MessageMapping("/unpause")
    void unpause(@Header("simpSessionId") String sessionId) {
        map.unpause(sessionId);
    }

    @MessageMapping("/reset")
    void reset(@Header("simpSessionId") String sessionId) {
        map.reset(sessionId);
    }

    @MessageMapping("/join")
    void join(@Header("simpSessionId") String sessionId, String id) {
        map.join(sessionId, id);
    }

    @MessageMapping("/move")
    void move(@Header("simpSessionId") String sessionId, Move move) {
        map.move(sessionId, move);
    }

    @MessageMapping("/setName")
    void setName(@Header("simpSessionId") String sessionId, String name) {
        map.setName(sessionId, name);
    }

    @MessageMapping("/addAI")
    void addAI(@Header("simpSessionId") String sessionId, String type) {
        map.addAI(sessionId, type);
    }
}
