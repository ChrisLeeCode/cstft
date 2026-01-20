package ws

import (
	"cstft/go/models"
	"encoding/json"
	"errors"
	"log"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

func CreatePlayer(join models.Message, conn *websocket.Conn) (*models.Player, error) {
	playerID := uuid.New().String()

	// Pull name from payload
	var playerName string
	if n, ok := join.Payload["playerName"].(string); ok {
		playerName = n
	} else {
		return nil, errors.New("error extracting player name from payload")
	}

	return &models.Player{ID: playerID, Conn: conn, Name: playerName}, nil
}

func JoinHandshake(conn *websocket.Conn) (models.Message, error) {

	var joinMessage models.Message

	_, raw, err := conn.ReadMessage()
	if err != nil {
		log.Println("failed initial read:", err)
		conn.Close()
		return joinMessage, err
	}

	if err := json.Unmarshal(raw, &joinMessage); err != nil || joinMessage.Type != models.JoinMessageType {
		log.Println("expected join message")
		conn.Close()
		return joinMessage, err
	}

	return joinMessage, nil
}
