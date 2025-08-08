CREATE TABLE
  driving_game.events (
    id serial NOT NULL,
    user_id integer NULL,
    event_type text NOT NULL,
    "timestamp" timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
    points_change integer NULL
  );

ALTER TABLE
  driving_game.events
ADD
  CONSTRAINT events_pkey PRIMARY KEY (id)
