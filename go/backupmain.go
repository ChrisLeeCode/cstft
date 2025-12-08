//go:build exclude

package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type      string         `json:"type"`
	Payload   map[string]any `json:"payload"`
	Timestamp int64          `json:"timestamp"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true }, // DEV ONLY
}

type Player struct {
	ID   int             `json:"id"`
	Conn *websocket.Conn `json:"-"`
	Name string          `json:"name"`
}

type GameRoom struct {
	mu           sync.Mutex
	players      []*Player      // up to 2
	takenChoices map[int]string // playerID -> "heads"|"tails"
}

var room = &GameRoom{takenChoices: make(map[int]string)}

func (gr *GameRoom) addPlayer(p *Player) {
	gr.mu.Lock()
	defer gr.mu.Unlock()
	if len(gr.players) < 2 {
		gr.players = append(gr.players, p)
	}
}

func (gr *GameRoom) removeConn(conn *websocket.Conn) {
	gr.mu.Lock()
	defer gr.mu.Unlock()
	// remove player and reset choices
	var kept []*Player
	var removedID int
	for _, pl := range gr.players {
		if pl.Conn != conn {
			kept = append(kept, pl)
		} else {
			removedID = pl.ID
		}
	}
	gr.players = kept
	delete(gr.takenChoices, removedID)
}

func (gr *GameRoom) broadcast(msg Message) {
	msg.Timestamp = time.Now().UnixMilli()
	for _, p := range gr.players {
		_ = p.Conn.WriteJSON(msg)
	}
}

func (gr *GameRoom) playersSummary() []map[string]any {
	res := make([]map[string]any, 0, len(gr.players))
	for _, p := range gr.players {
		res = append(res, map[string]any{"id": p.ID, "name": p.Name})
	}
	return res
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}

	// Seed RNG once (safe enough for demo); could move to init()
	rand.Seed(time.Now().UnixNano())

	// Assign player id 1 or 2
	var playerID int
	var playerName string

	// Join handshake must be first from client
	_, raw, err := conn.ReadMessage()
	if err != nil {
		log.Println("failed initial read:", err)
		conn.Close()
		return
	}
	var join Message
	if err := json.Unmarshal(raw, &join); err != nil || join.Type != "join" {
		log.Println("expected join message")
		conn.Close()
		return
	}
	if n, ok := join.Payload["name"].(string); ok {
		playerName = n
	}

	// Allocate ID and add to room
	room.mu.Lock()
	playerID = 1
	if len(room.players) == 1 {
		playerID = 2
	}
	p := &Player{ID: playerID, Conn: conn, Name: playerName}
	room.players = append(room.players, p)
	// trim if somehow >2
	if len(room.players) > 2 {
		room.players = room.players[:2]
	}
	room.mu.Unlock()

	// Send joined acknowledgement
	_ = conn.WriteJSON(Message{Type: "joined", Payload: map[string]any{
		"playerId": playerID,
		"players":  room.playersSummary(),
	}})

	// If two players, announce ready state
	if len(room.players) == 2 {
		room.broadcast(Message{Type: "ready", Payload: map[string]any{
			"players":      room.playersSummary(),
			"takenChoices": room.takenChoices,
			"message":      "Both players connected. Choose heads or tails.",
		}})
	} else {
		room.broadcast(Message{Type: "waiting", Payload: map[string]any{
			"players": room.playersSummary(),
			"message": "Waiting for another player...",
		}})
	}

	// Reader loop
	go func() {
		defer func() {
			room.removeConn(conn)
			conn.Close()
			room.broadcast(Message{Type: "waiting", Payload: map[string]any{
				"players": room.playersSummary(),
				"message": "A player left. Waiting for another player...",
			}})
		}()

		for {
			var msg Message
			if err := conn.ReadJSON(&msg); err != nil {
				if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
					log.Println("client closed")
				} else {
					log.Println("read error:", err)
				}
				return
			}

			switch msg.Type {
			case "choose":
				choice, _ := msg.Payload["choice"].(string) // "heads" or "tails"
				if choice != "heads" && choice != "tails" {
					_ = conn.WriteJSON(Message{Type: "error", Payload: map[string]any{"message": "choice must be heads or tails"}})
					continue
				}
				room.mu.Lock()
				// Enforce unique choices: if already taken, reject
				for pid, c := range room.takenChoices {
					if c == choice && pid != playerID {
						room.mu.Unlock()
						_ = conn.WriteJSON(Message{Type: "error", Payload: map[string]any{"message": "That side is already taken"}})
						continue
					}
				}
				room.takenChoices[playerID] = choice
				// Notify both players about taken choices
				room.broadcast(Message{Type: "choice_update", Payload: map[string]any{"takenChoices": room.takenChoices}})
				// If both players have chosen, flip coin
				if len(room.takenChoices) == 2 && len(room.players) == 2 {
					flip := "heads"
					if rand.Intn(2) == 1 {
						flip = "tails"
					}
					// find winner
					winnerID := 0
					for pid, c := range room.takenChoices {
						if c == flip {
							winnerID = pid
							break
						}
					}
					room.broadcast(Message{Type: "result", Payload: map[string]any{
						"flip":           flip,
						"winnerPlayerId": winnerID,
						"takenChoices":   room.takenChoices,
					}})
					// reset for next round (keep both players connected)
					room.takenChoices = make(map[int]string)
				}
				room.mu.Unlock()
			case "ping":
				_ = conn.WriteJSON(Message{Type: "pong", Payload: msg.Payload})
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
