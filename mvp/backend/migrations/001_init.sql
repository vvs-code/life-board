CREATE TABLE spaces (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  color      text NOT NULL DEFAULT '#2F9E6B',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id          serial PRIMARY KEY,
  space_id    integer NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  deadline    timestamptz,
  priority    text NOT NULL DEFAULT 'mid' CHECK (priority IN ('zero', 'low', 'mid', 'high')),
  status      text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO spaces (name, color) VALUES ('Жизнь', '#2F9E6B');
