from fastapi import FastAPI
from database import add_todo, get_todo, get_all_todo, update_todo, delete_todo, Todo

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


print(add_todo('123'))
print(get_todo(1))
print(add_todo('321'))
print(add_todo('5654'))
print(add_todo('98871'))
print(update_todo(1, 'now done', True))
print(get_all_todo())


@app.get("/todo/read/{todo_id}", response_model=None)
def read_todo_endpoint(todo_id: str):
    todo = get_todo(int(todo_id))

    return todo


@app.get("/todo/read", response_model=None)
def read_all_todo_endpoint(q: str | None):
    print(q)
    todos = get_all_todo(q)

    return list(map(lambda todo: Todo(id=todo[0], body=todo[1], done=todo[2]), todos))


@app.post("/todo/create", response_model=None)
def create_todo_endpoint(body: Todo):
    todo = add_todo(body.body)
    return todo


@app.patch("/todo/update/{todo_id}", response_model=None)
def update_todo_endpoint(todo_id: str, body: Todo):
    todo = update_todo(int(todo_id), body.body, body.done)
    return todo


@app.delete("/todo/delete/{todo_id}", response_model=None)
def delete_todo_endpoint(todo_id: str):
    return delete_todo(int(todo_id))
