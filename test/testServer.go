package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"

	"golang.org/x/net/websocket"
)

//ServeMux : multiplexer that keeps track of every function to be called on specific rpc call
type ServeMux struct {
	m               map[string]func([]interface{}) map[string]interface{}
	defaultFunction func(http.ResponseWriter, *http.Request)
}

//an instance of the multiplexer
var mainMux ServeMux

//RegisterFunc : a function to register functions to be called for specific rpc calls
func RegisterFunc(pattern string, handler func([]interface{}) map[string]interface{}) {
	mainMux.m[pattern] = handler
}

//SetDefaultFunc : a function to be called if the request is not a HTTP JSON RPC call
func SetDefaultFunc(def func(http.ResponseWriter, *http.Request)) {
	mainMux.defaultFunction = def
}

//JSONRpcHandler : this is the funciton that should be called in order to answer an rpc call
//should be registered like "http.HandleFunc("/", httpjsonrpc.Handle)"
func JSONRpcHandler(w http.ResponseWriter, r *http.Request) {
	//JSON RPC commands should be POSTs
	if r.Method != "POST" {
		if mainMux.defaultFunction != nil {
			log.Printf("HTTP JSON RPC Handle - Method!=\"POST\"")
			mainMux.defaultFunction(w, r)
		} else {
			log.Panicf("HTTP JSON RPC Handle - Method!=\"POST\"")
		}
		return
	}

	//We must check if there is Request Body to read
	if r.Body == nil {
		if mainMux.defaultFunction != nil {
			log.Printf("HTTP JSON RPC Handle - Request body is nil")
			mainMux.defaultFunction(w, r)
		} else {
			log.Panicf("HTTP JSON RPC Handle - Request body is nil")
		}
		return
	}

	//read the body of the request
	body, err := ioutil.ReadAll(r.Body)
	//log.Println(r)
	//log.Println(body)
	if err != nil {
		log.Fatalf("HTTP JSON RPC Handle - ioutil.ReadAll: %v", err)
		return
	}
	request := make(map[string]interface{})
	//unmarshal the request
	err = json.Unmarshal(body, &request)
	if err != nil {
		log.Fatalf("HTTP JSON RPC Handle - json.Unmarshal: %v", err)
		return
	}
	//log.Println(request["method"])

	//get the corresponding function
	fn, ok := mainMux.m[request["method"].(string)]

	if ok { //if the function exists, itis called
		response := fn(request["params"].([]interface{}))
		//response from the program is encoded
		data, err := json.Marshal(response)
		if err != nil {
			log.Fatalf("HTTP JSON RPC Handle - json.Marshal: %v", err)
			return
		}
		//result is printed to the output
		w.Write(data)
	} else { //if the function does not exist
		log.Println("HTTP JSON RPC Handle - No function to call for", request["method"])
		/*
		   	//if you don't want to send an error, send something else:
		   	data, err := json.Marshal(map[string]interface{}{
		       	"result": "OK!",
		       	"error": nil,
		       	"id": request["id"],
		   	})*/
		//an error json is created
		data, err := json.Marshal(map[string]interface{}{
			"result": nil,
			"error": map[string]interface{}{
				"code":    -32601,
				"message": "Method not found",
				"data":    "The called method was not found on the server",
			},
			"id": request["id"],
		})
		if err != nil {
			log.Fatalf("HTTP JSON RPC Handle - json.Marshal: %v", err)
			return
		}
		//it is printed
		w.Write(data)
	}
}

func wsJSONRpcHandler(ws *websocket.Conn) {
	for {
		var body []byte

		//read the body of the request
		err := websocket.Message.Receive(ws, &body)
		if err == io.EOF {
			break
		}
		if err != nil && err != io.EOF {
			log.Fatalf("HTTP JSON RPC Handle - ws.Read: %v", err)
			continue
		}
		fmt.Printf("Received: %s\n", string(body))

		request := make(map[string]interface{})
		//unmarshal the request
		err = json.Unmarshal(body, &request)
		if len(body) == 0 {
			continue
		}
		if err != nil {
			log.Fatalf("HTTP JSON RPC Handle - json.Unmarshal: %v", err)
			continue
		}
		//log.Println(request["method"])

		//get the corresponding function
		fn, ok := mainMux.m[request["method"].(string)]
		if ok { //if the function exists, itis called
			response := fn(request["params"].([]interface{}))
			//response from the program is encoded
			data, err := json.Marshal(response)
			if err != nil {
				log.Fatalf("HTTP JSON RPC Handle - json.Marshal: %v", err)
				continue
			}
			//result is printed to the output
			// ws.Write(data)
			if err := websocket.Message.Send(ws, string(data)); err != nil {
				log.Fatal("Can't send data")
				break
			}
		} else { //if the function does not exist
			log.Println("HTTP JSON RPC Handle - No function to call for", request["method"])
			//an error json is created
			data, err := json.Marshal(map[string]interface{}{
				"result": nil,
				"error": map[string]interface{}{
					"code":    -32601,
					"message": "Method not found",
					"data":    "The called method was not found on the server",
				},
				"id": request["id"],
			})
			if err != nil {
				log.Fatalf("HTTP JSON RPC Handle - json.Marshal: %v", err)
				continue
			}
			//it is printed
			// ws.Write(data)
			if err := websocket.Message.Send(ws, string(data)); err != nil {
				log.Fatal("Can't send data")
				break
			}
		}
	}
}

func Add(params []interface{}) map[string]interface{} {
	ret := make(map[string]interface{})
	paramslen := len(params)
	if paramslen != 2 {
		ret["error"] = "error"
		return ret
	}
	res := params[0].(float64) + params[1].(float64)
	ret["result"] = res
	return ret
}

func main() {
	mainMux.m = make(map[string](func([]interface{}) map[string]interface{}))
	RegisterFunc("add", Add)
	http.HandleFunc("/ws",
		func(w http.ResponseWriter, req *http.Request) {
			s := websocket.Server{Handler: websocket.Handler(wsJSONRpcHandler)}
			s.ServeHTTP(w, req)
		})
	http.HandleFunc("/http", JSONRpcHandler)
	fmt.Println("Server start at :8080 ...")
	http.ListenAndServe(":8080", nil)
}
