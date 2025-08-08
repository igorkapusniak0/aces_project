CREATE TABLE
  driving_game.users (
    id serial NOT NULL,
    name text NOT NULL,
    total_points integer NULL DEFAULT 0,
    location double precision[] NULL DEFAULT '{0,0}'::double precision[],
    created_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP
  );

ALTER TABLE
  driving_game.users
ADD
  CONSTRAINT users_pkey PRIMARY KEY (id)
