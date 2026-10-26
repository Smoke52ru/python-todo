import sqlite3
from pydantic import BaseModel

# class Todo:
#     def __init__(self,
#                  id:int,
#                  body:str,
#                  done:bool):
#         self.id = id
#         self.body = body
#         self.done = done

#     def __str__(self) -> str:
#         return f'({self.id},{self.body},{self.done})'


class Todo(BaseModel):
    id:int
    body:str
    done:bool

    def __str__(self) -> str:
        return f'({self.id},{self.body},{self.done})'


connection = sqlite3.connect('todo.db', check_same_thread=False)

connection.execute('''
DROP TABLE Todo
''')
connection.commit()

connection.execute('''
CREATE TABLE IF NOT EXISTS Todo (
id INTEGER PRIMARY KEY AUTOINCREMENT,
body TEXT NOT NULL,
done BOOLEAN DEFAULT FALSE
)
''')
connection.commit()


def add_todo(body: str):
    cursor = connection.cursor()
    cursor.execute(
        '''INSERT INTO Todo(body) VALUES(?)''',(body,))
    connection.commit()
    todo_id = cursor.lastrowid
    row = cursor.execute(
            "SELECT id, body, done FROM Todo WHERE id = (?)",
            (todo_id,),
        ).fetchone()

    id, body, done = row
    return Todo(id=id, body=body, done=done)

def get_todo(id: int) -> Todo:
    cursor = connection.execute(
        '''SELECT id,body,done 
        FROM Todo 
        WHERE id = (?)
        ORDER by id ASC''',(str(id),))
    result = cursor.fetchone()

    id, body, done = result
    return Todo(id=id, body=body, done=done)

def get_all_todo(q: str | None = None):
    query = '''SELECT id,body,done
                    FROM Todo
                    '''
    if q != None:
        search_param = f"%{q}%"
        query += '''
            WHERE body LIKE (?)
            ORDER by id ASC'''
        
        result = connection.execute(query, (search_param,)).fetchall()
    else:
        query += '''
            ORDER by id ASC'''
        result = connection.execute(query).fetchall()

    return result

def update_todo(id: int, body: str, done: bool):
    connection.execute(
        '''UPDATE Todo 
        SET body = (?), done = (?)
        WHERE id = (?)''',(body,done,str(id)))
    connection.commit()
    row = connection.execute(
            "SELECT id, body, done FROM Todo WHERE id = (?)",
            (id,),
        ).fetchone()

    id,body,done = row
    return Todo(id=id, body=body, done=done)
    

def delete_todo(id: int):
    connection.execute(
        '''DELETE FROM Todo 
        WHERE id = (?)''',(str(id),))
    connection.commit()
    return {'message': 'Successfuly deleted'}
        