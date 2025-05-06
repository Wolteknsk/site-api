import pytest
import json
from app import app, db, Book

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_add_book(client):
    """Тест добавления книги"""
    response = client.post('/books', 
                         json={'title': 'Test Book', 'author': 'Test Author'},
                         headers={'Content-Type': 'application/json'})
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Test Book'
    assert data['author'] == 'Test Author'
    assert 'id' in data

def test_delete_book(client):
    """Тест удаления книги"""
    # Сначала создаем книгу
    client.post('/books', 
              json={'title': 'To Delete', 'author': 'Author'},
              headers={'Content-Type': 'application/json'})
    
    # Затем удаляем
    response = client.delete('/books/1')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert data['message'] == 'Книга успешно удалена'  # Проверяем точное сообщение
    
    # Проверяем, что книга действительно удалена
    check_response = client.get('/books')
    assert len(json.loads(check_response.data)) == 0

def test_get_empty_list(client):
    """Тест пустой коллекции"""
    response = client.get('/books')
    assert response.status_code == 200
    assert json.loads(response.data) == []

def test_invalid_add(client):
    """Тест невалидных данных"""
    # Без названия
    response = client.post('/books', 
                         json={'author': 'Author Only'},
                         headers={'Content-Type': 'application/json'})
    assert response.status_code == 400
    
    # Без автора
    response = client.post('/books', 
                         json={'title': 'Title Only'},
                         headers={'Content-Type': 'application/json'})
    assert response.status_code == 400

def test_delete_nonexistent(client):
    """Тест удаления несуществующей книги"""
    response = client.delete('/books/999')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['error'] == 'Книга не найдена'