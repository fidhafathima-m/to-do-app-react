import React, { useState, useRef, useEffect } from "react";
import './ToDoApp.css';
import { FaEdit, FaTrash, FaHandPointUp, FaHandPointDown } from "react-icons/fa";
import { IoMdDoneAll, IoMdCloseCircleOutline } from "react-icons/io";

function ToDoApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTasks(JSON.parse(storedTodos));
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("todos", JSON.stringify(tasks));
    }
  }, [tasks, isInitialized]);

  const handleInput = (e) => {
    setNewTask(e.target.value);
  };

  const addTask = (e) => {
    e.preventDefault();
    const trimmedTask = newTask.trim();
    if (trimmedTask === '') return;

    const isDuplicate = tasks.some(
      (task) => task.text.toLowerCase() === trimmedTask.toLowerCase() && task.id !== editId
    );
    if (isDuplicate) {
      setErrorMessage("This task already exists!");
      inputRef.current.focus();
      return;
    }

    if (editId !== null) {
      const updatedTasks = tasks.map(task =>
        task.id === editId ? { ...task, text: newTask } : task
      );
      setTasks(updatedTasks);
      setEditId(null);
    } else {
      setTasks([...tasks, { id: Date.now(), text: trimmedTask, completed: false }]);
    }

    setNewTask('');
    setErrorMessage('')
    inputRef.current.focus();
  };

  const deleteTask = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (confirmed) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const completeTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const editTask = (id) => {
    const taskToEdit = tasks.find(task => task.id === id);
    setNewTask(taskToEdit.text);
    setEditId(id);
    inputRef.current.focus();
  };

  const moveTaskUp = (id) => {
    const index = tasks.findIndex(task => task.id === id);
    if (index > 0) {
      const newTasks = [...tasks];
      [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
      setTasks(newTasks);
    }
  };

  const moveTaskDown = (id) => {
    const index = tasks.findIndex(task => task.id === id);
    if (index < tasks.length - 1) {
      const newTasks = [...tasks];
      [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
      setTasks(newTasks);
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  function clearTasks() {
    const confirmed = window.confirm("Are you sure you want to clear all tasks?");
    if (confirmed) {
      setTasks([]);
    }
  }
  function completeAllTasks() {
    const confirmed = window.confirm("Are you sure you want to complete all tasks?");
    if (confirmed) {
      setTasks(t => 
        t.map(task => ({...task, completed: true}))
      );
    }
  }

  return (
    <div className="container">
      <h2>To-Do-App</h2>
      <form className="form-group" onSubmit={addTask}>
        <input
          type="text"
          placeholder="Enter a task..."
          onChange={handleInput}
          ref={inputRef}
          value={newTask}
          className={errorMessage ? 'input-error' : ''}
        />
        <button className="add-button">{editId !== null ? 'EDIT' : 'ADD'}</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {tasks.length > 0 && (
        <>
          <p className="task-summary">
            Completed Tasks: {completedCount} / {tasks.length}
          </p>
          <button onClick={clearTasks} className="clear-button">Clear All Tasks</button>
          {tasks.some(task => !task.completed) && (
              <button onClick={completeAllTasks} className="clear-button">Complete All Tasks</button>
          )}

          
            <div className="filter-buttons">
              <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
              <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
              <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>Pending</button>
            </div>
          </>
      )}

      {filter === 'completed' && filteredTasks.length === 0 && (
        <p className="no-tasks-message">No tasks completed yet.</p>
      )}

      <ol>
        {filteredTasks.map(task => (
          <li key={task.id}>
            <span className={`text ${task.completed ? "completed" : ""}`}>{task.text}</span>
            <div className="buttons">
              <button onClick={() => completeTask(task.id)} title={task.completed ? "Mark as incomplete" : "Mark as complete"}>
                {task.completed
                  ? <IoMdCloseCircleOutline className="not-done-button" />
                  : <IoMdDoneAll className="done-button" />}
              </button>
              <button className="edit-button" onClick={() => editTask(task.id)}><FaEdit title="edit" /></button>
              <button className="delete-button" onClick={() => deleteTask(task.id)}><FaTrash title="delete" /></button>
              <button className="move-button-up" onClick={() => moveTaskUp(task.id)}><FaHandPointUp title="move up"/></button>
              <button className="move-button-down" onClick={() => moveTaskDown(task.id)}><FaHandPointDown title="move down"/></button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default ToDoApp;
