// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Получаем нужные элементы
    const bookForm = document.getElementById('bookForm');
    const booksList = document.getElementById('books');
    const searchInput = document.getElementById('search');
    const bookCount = document.getElementById('bookCount');
    const loadingIndicator = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const notification = document.getElementById('notification');
    
    let books = []; // Здесь будем хранить все книги
    
    // Загружаем книги при загрузке страницы
    loadBooks();
    
    // Обработчик отправки формы
    bookForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Получаем данные из формы
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        
        // Проверяем, что поля заполнены
        if (!title || !author) {
            showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }
        
        try {
            // Отправляем запрос на сервер
            const response = await fetch('http://127.0.0.1:5000/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    author: author
                })
            });
            
            // Проверяем ответ сервера
            if (!response.ok) {
                throw new Error('Что-то пошло не так');
            }
            
            // Показываем уведомление об успехе
            showNotification(`Книга "${title}" успешно добавлена!`, 'success');
            
            // Очищаем форму
            bookForm.reset();
            
            // Обновляем список книг
            loadBooks();
        } catch (error) {
            console.error('Ошибка при добавлении книги:', error);
            showNotification('Не удалось добавить книгу', 'error');
        }
    });
    
    // Поиск книг
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm)
        );
        renderBooks(filteredBooks);
    });
    
    // Функция загрузки книг с сервера
    async function loadBooks() {
        try {
            // Показываем индикатор загрузки
            loadingIndicator.style.display = 'flex';
            booksList.style.display = 'none';
            emptyState.classList.add('hidden');
            
            // Делаем запрос к API
            const response = await fetch('http://127.0.0.1:5000/books');
            
            // Проверяем статус ответа
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            // Получаем данные
            books = await response.json();
            
            // Обновляем счетчик книг
            bookCount.textContent = books.length;
            
            // Рендерим книги
            renderBooks(books);
            
            // Показываем состояние пустого списка, если книг нет
            if (books.length === 0) {
                emptyState.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Ошибка при загрузке книг:', error);
            showNotification('Не удалось загрузить книги', 'error');
            
            // Показываем сообщение об ошибке в списке
            booksList.innerHTML = `
                <li class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>Попробуйте перезагрузить страницу</p>
                </li>
            `;
            booksList.style.display = 'grid';
        } finally {
            // Скрываем индикатор загрузки
            loadingIndicator.style.display = 'none';
        }
    }
    
    // Функция отрисовки книг
    function renderBooks(booksToRender) {
        // Очищаем список
        booksList.innerHTML = '';
        
        // Если книг нет, показываем пустое состояние
        if (booksToRender.length === 0) {
            emptyState.classList.remove('hidden');
            booksList.style.display = 'none';
            return;
        }
        
        // Скрываем пустое состояние
        emptyState.classList.add('hidden');
        booksList.style.display = 'grid';
        
        // Добавляем каждую книгу в список
        booksToRender.forEach(book => {
            const bookElement = document.createElement('li');
            bookElement.innerHTML = `
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <button class="delete-btn" onclick="deleteBook(${book.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            booksList.appendChild(bookElement);
        });
    }
    
    // Функция показа уведомлений
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Убираем уведомление через 3 секунды
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
});

// Глобальная функция для удаления книги
async function deleteBook(bookId) {
    // Подтверждение удаления
    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) {
        return;
    }
    
    try {
        // Отправляем запрос на удаление
        const response = await fetch(`http://127.0.0.1:5000/books/${bookId}`, {
            method: 'DELETE'
        });
        
        // Проверяем ответ
        if (!response.ok) {
            throw new Error('Не удалось удалить книгу');
        }
        
        // Показываем уведомление
        const notification = document.getElementById('notification');
        notification.textContent = 'Книга успешно удалена';
        notification.className = 'notification success';
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
        
        // Обновляем список книг
        document.dispatchEvent(new Event('DOMContentLoaded'));
    } catch (error) {
        console.error('Ошибка при удалении книги:', error);
        
        // Показываем уведомление об ошибке
        const notification = document.getElementById('notification');
        notification.textContent = 'Ошибка при удалении книги';
        notification.className = 'notification error';
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
}