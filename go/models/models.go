package models

import "github.com/gorilla/websocket"

type MessageType string

// Client message types (received by server from client)
const (
	JoinMessageType         MessageType = "JOIN"
	ReadyStatusMessageType  MessageType = "READY_STATUS"
	AddCharacterMessageType MessageType = "ADD_CHARACTER"
	ChooseMessageType       MessageType = "CHOOSE"
	PingMessageType         MessageType = "PING"
)

// Server message types (sent by server to client)
const (
	JoinedMessageType       MessageType = "JOINED"
	LobbyDataMessageType    MessageType = "LOBBY_DATA"
	GameStageMessageType    MessageType = "GAME_STAGE"
	ErrorMessageType        MessageType = "ERROR"
	PongMessageType         MessageType = "PONG"
	WaitingMessageType      MessageType = "WAITING"
	ChoiceUpdateMessageType MessageType = "CHOICE_UPDATE"
	ResultMessageType       MessageType = "RESULT"
)

type Message struct {
	Type      MessageType    `json:"type"`
	Payload   map[string]any `json:"payload"`
	Timestamp int64          `json:"timestamp"`
}

type Player struct {
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

// Client message structs (sent from client to server)
type JoinMessage struct {
	Type    MessageType `json:"type" tstype:"'JOIN'"`
	Payload struct {
		PlayerName string `json:"playerName"`
	} `json:"payload"`
}

type ReadyStatusMessage struct {
	Type    MessageType `json:"type" tstype:"'READY_STATUS'"`
	Payload struct {
		Status bool `json:"status"`
	} `json:"payload"`
}

type AddCharacterMessage struct {
	Type    MessageType `json:"type" tstype:"'ADD_CHARACTER'"`
	Payload struct {
		Character Character `json:"character"`
	} `json:"payload"`
}

type ChooseMessage struct {
	Type    MessageType `json:"type" tstype:"'CHOOSE'"`
	Payload struct {
		Choice string `json:"choice"` // "heads" or "tails"
	} `json:"payload"`
}

type PingMessage struct {
	Type    MessageType `json:"type" tstype:"'PING'"`
	Payload struct{}    `json:"payload"`
}

// Server message structs (sent from server to client)

type JoinedMessage struct {
	Timestamp int64       `json:"timestamp"`
	Type      MessageType `json:"type" tstype:"'JOINED'"`
	Payload   struct {
		PlayerID int `json:"playerId"`
	} `json:"payload"`
}

type LobbyDataMessage struct {
	Timestamp int64       `json:"timestamp"`
	Type      MessageType `json:"type" tstype:"'LOBBY_DATA'"`
	Payload   struct {
		Players []Player `json:"players"`
	} `json:"payload"`
}

type GameStageMessage struct {
	Timestamp int64       `json:"timestamp"`
	Type      MessageType `json:"type" tstype:"'GAME_STAGE'"`
	Payload   struct {
		Stage string `json:"stage"`
	} `json:"payload"`
}

type ErrorMessage struct {
	Timestamp int64       `json:"timestamp"`
	Type      MessageType `json:"type" tstype:"'ERROR'"`
	Payload   struct {
		Message string `json:"message"`
	} `json:"payload"`
}

type PongMessage struct {
	Timestamp int64       `json:"timestamp"`
	Type      MessageType `json:"type" tstype:"'PONG'"`
	Payload   struct{}    `json:"payload"`
}
