package models

import "github.com/gorilla/websocket"

type Message struct {
	Type      string         `json:"type"`
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
