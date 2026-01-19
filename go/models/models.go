package models

import "github.com/gorilla/websocket"

type MessageType string

const (
	ReadyStatusMessageType MessageType = "READY_STATUS"
	LobbyDataMessageType   MessageType = "LOBBY_DATA"
	GameStageMessageType   MessageType = "GAME_STAGE"
	JoinedMessageType      MessageType = "JOINED"
)

type Message struct {
	Type      MessageType    `json:"type"`
	Payload   map[string]any `json:"payload"`
	Timestamp int64          `json:"timestamp"`
}

type PlayerData struct {
	ID         string          `json:"id"`
	Conn       *websocket.Conn `json:"-"`
	Name       string          `json:"name"`
	IsReady    bool            `json:"isReady"`
	Characters []Character     `json:"characters"`
}

type Character struct {
	Pos      Coordinate `json:"pos"`
	Rotation int64      `json:"rotation"`
}

type Coordinate struct {
	X int16 `json:"x"`
	Y int16 `json:"y"`
}

// Server message types
type BaseServerMessage struct {
	Timestamp int64       `json:"timestamp"`
	Type      MessageType `json:"type"`
}

type JoinedType = MessageType

type JoinedMessage struct {
	Timestamp int64             `json:"timestamp"`
	Type      JoinedMessageType `json:"type" tstype:"'joined'"`
	Payload   struct {
		PlayerID int `json:"playerId"`
	} `json:"payload"`
}

type LobbyDataMessage struct {
	BaseServerMessage
	Payload struct {
		Players []PlayerData `json:"players"`
	} `json:"payload"`
}

type GameStageMessage struct {
	BaseServerMessage
	Payload struct {
		Stage string `json:"stage"`
	} `json:"payload"`
}

type ErrorMessage struct {
	BaseServerMessage
	Payload struct {
		Message string `json:"message"`
	} `json:"payload"`
}
