from websocket_server import WebsocketServer
import json

clients = []
client_symbols = {}
symbols = ['X', 'O']

def new_client(client, server):
    if len(clients) < 2:
        clients.append(client)
        symbol = symbols[len(clients) - 1]
        client_symbols[client['id']] = symbol
        
        init_data = json.dumps({
            'type': 'init',
            'symbol': symbol
        })
        server.send_message(client, init_data)
        print(f"Клиент {client['id']} подключился, играет за {symbol}")
    else:
        error_data = json.dumps({'type': 'error', 'message': 'Сервер заполнен'})
        server.send_message(client, error_data)
        print(f"Клиент {client['id']} отклонён - сервер заполнен")

def client_left(client, server):
    if client in clients:
        clients.remove(client)
    if client['id'] in client_symbols:
        del client_symbols[client['id']]
    print(f"Клиент {client['id']} отключился")

def message_received(client, server, message):
    print(f"Получено сообщение от {client['id']}: {message}")
    # Отправляем сообщение всем клиентам (включая отправителя)
    for c in clients:
        server.send_message(c, message)

server = WebsocketServer(host='127.0.0.1', port=8765)
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_received)

print("Сервер запущен на ws://127.0.0.1:8765")
server.run_forever()