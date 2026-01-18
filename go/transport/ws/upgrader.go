package ws

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

func upgrader() websocket.Upgrader {
	return websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true }, // DEV ONLY
	}
}

func NewConn(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	upgrader := upgrader()
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return nil, err
	}

	return conn, nil
}
