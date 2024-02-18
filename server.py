import asyncio
import websockets
import json


async def ask(websocket, prompt):
    await websocket.send("type/input:" + prompt)
    return await websocket.recv()


async def output(websocket, format, message):
    if format == "json":
        message = json.dumps(message)
    await websocket.send(f"type/output/{format}:" + message)


async def hello(websocket, path):
    print("1")
    name = await ask(websocket, "What's your name?")
    print("2")
    age = await ask(websocket, "What's your age?")
    work = await ask(websocket, "Where do you work?")

    print({"name": name, "age": age, "work": work})

    await output(websocket, "json", {"name": name, "age": age, "work": work})


start_server = websockets.serve(hello, "localhost", 8765)
print("serve")

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
