CREATE DATABASE IF NOT EXISTS todo_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE todo_app;

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status ENUM('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  assignee VARCHAR(80) NULL,
  due_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO tasks (title, description, status, assignee, due_date) VALUES
('Plan content','Propose content and planning','todo','Fai','2025-08-13'),
('Prepare meeting presentation','Propose budget topic','todo','Best','2025-08-14'),
('Submit meeting report','Report on project progress','todo','Fai','2025-08-15'),
('Edit 3 clips to completion','Launch event clips','in_progress','Fai','2025-08-11'),
('Edit Zigmadey clip',NULL,'done','Team','2025-08-08');

