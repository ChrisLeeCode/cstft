package main

import (
	"cstft/go/models"
	"cstft/go/transport/ws"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type GameRoom struct {
	mu           sync.Mutex
	players      map[string]*models.Player
	takenChoices map[string]string // playerID -> "heads"|"tails"
	stage        string            // lobby, gameStarted
}

var room = &GameRoom{takenChoices: make(map[string]string)}

func (gr *GameRoom) removeConn(conn *websocket.Conn) {
	gr.mu.Lock()
	defer gr.mu.Unlock()
	// remove player and reset choices
	var kept []*models.Player
	var removedID string
	for _, pl := range gr.players {
		if pl.Conn == conn {
			removedID = pl.ID
			kept = append(kept, pl)
		}
	}
	delete(gr.players, removedID)
	delete(gr.takenChoices, removedID)
}

func (gr *GameRoom) broadcast(msg models.Message) {
	msg.Timestamp = time.Now().UnixMilli()
	for _, p := range gr.players {
		_ = p.Conn.WriteJSON(msg)
	}
}

func (gr *GameRoom) playersSummary() []map[string]any {
	res := make([]map[string]any, 0, len(gr.players))
	for _, p := range gr.players {
		res = append(res, map[string]any{"id": p.ID, "name": p.Name, "isReady": p.IsReady})
	}
	return res
}

func wsHandler(w http.ResponseWriter, r *http.Request) {

	conn, err := ws.NewConn(w, r)
	if err != nil {
		return
	}

	connMessage, err := ws.JoinHandshake(conn)
	if err != nil {
		return
	}

	player, err := ws.CreatePlayer(connMessage, conn)
	if err != nil {
		return
	}

	// Add player to room
	room.mu.Lock()

	// Initialize players map if not already
	if room.players == nil {
		room.players = map[string]*models.Player{}
	}

	if room.stage == "" {
		room.stage = "lobby"
	}

	room.players[player.ID] = player
	room.mu.Unlock()

	// Send joined acknowledgement
	_ = conn.WriteJSON(models.Message{Type: "joined", Payload: map[string]any{
		"playerId": player.ID,
		"players":  room.playersSummary(),
	}})

	// Broadcast lobby change
	room.broadcast(models.Message{Type: models.LobbyDataMessage, Payload: map[string]any{
		"players": room.playersSummary(),
	}})

	// Reader loop for new player's connection
	go func() {
		defer func() {
			room.removeConn(conn)
			conn.Close()
			room.broadcast(models.Message{Type: "waiting", Payload: map[string]any{
				"players": room.playersSummary(),
				"message": "A player left. Waiting for another player...",
			}})
		}()

		for {
			var msg models.Message
			// Close connection if there is an error reading message
			if err := conn.ReadJSON(&msg); err != nil {
				if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
					log.Println("client closed")
				} else {
					log.Println("read error:", err)
				}
				return
			}

			switch msg.Type {
			case models.MessageTypeTest:

			case "choose":
				choice, _ := msg.Payload["choice"].(string) // "heads" or "tails"
				if choice != "heads" && choice != "tails" {
					_ = conn.WriteJSON(models.Message{Type: "error", Payload: map[string]any{"message": "choice must be heads or tails"}})
					continue
				}
				room.mu.Lock()
				// Enforce unique choices: if already taken, reject
				for pid, c := range room.takenChoices {
					if c == choice && pid != player.ID {
						room.mu.Unlock()
						_ = conn.WriteJSON(models.Message{Type: "error", Payload: map[string]any{"message": "That side is already taken"}})
						continue
					}
				}
				room.takenChoices[player.ID] = choice
				// Notify both players about taken choices
				room.broadcast(models.Message{Type: "choice_update", Payload: map[string]any{"takenChoices": room.takenChoices}})
				// If both players have chosen, flip coin
				if len(room.takenChoices) == 2 && len(room.players) == 2 {
					flip := "heads"
					if rand.Intn(2) == 1 {
						flip = "tails"
					}
					// find winner
					var winnerID string
					for pid, c := range room.takenChoices {
						if c == flip {
							winnerID = pid
							break
						}
					}
					room.broadcast(models.Message{Type: "result", Payload: map[string]any{
						"flip":           flip,
						"winnerPlayerId": winnerID,
						"takenChoices":   room.takenChoices,
					}})
					// reset for next round (keep both players connected)
					room.takenChoices = make(map[string]string)
				}
				room.mu.Unlock()
			case models.ReadyStatusMessage:
				status, _ := msg.Payload["status"].(bool)
				room.mu.Lock()
				room.players[player.ID].IsReady = status

				// Broadcast lobby change
				room.broadcast(models.Message{Type: models.LobbyDataMessage, Payload: map[string]any{
					"players": room.playersSummary(),
				}})

				// If all players have readied up - move the game state to "gameStarted"
				allReady := true
				for _, player := range room.players {
					if !player.IsReady {
						allReady = false
					}
				}

				if allReady && room.stage == "lobby" {
					room.stage = "gameStarted"
					// Broadcast lobby change
					room.broadcast(models.Message{Type: "gameStage", Payload: map[string]any{
						"stage": "gameStarted",
					}})
				}
				room.mu.Unlock()
			case "addCharacter":
				room.mu.Lock()
				room.players[player.ID].Characters = append(room.players[player.ID].Characters, models.Character{Pos: models.Coordinate{X: 0, Y: 0}, Rotation: 0})

			case "ping":
				_ = conn.WriteJSON(models.Message{Type: "pong", Payload: msg.Payload})
			}
		}
	}()
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.HandleFunc("/ws", wsHandler)
	log.Println("Heads/Tails server listening on :8080 ...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
