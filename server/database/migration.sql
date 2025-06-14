Table users {
  id int [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password varchar(255) [not null]
  bio text
  avatar_url varchar(255)
  created_at datetime [default: `now()`]
  updated_at datetime
}

Table posts {
  id int [pk, increment]
  user_id int [ref: > users.id]
  content text
  image_url varchar(255)
  created_at datetime [default: `now()`]
  updated_at datetime
}

Table comments {
  id int [pk, increment]
  user_id int [ref: > users.id]
  post_id int [ref: > posts.id]
  content text [not null]
  created_at datetime [default: `now()`]
}

Table likes {
  id int [pk, increment]
  user_id int [ref: > users.id]
  post_id int [ref: > posts.id]
  created_at datetime [default: `now()`]
}

Table follows {
  id int [pk, increment]
  follower_id int [ref: > users.id]
  following_id int [ref: > users.id]
  created_at datetime [default: `now()`]
}

Table messages {
  id int [pk, increment]
  sender_id int [ref: > users.id]
  receiver_id int [ref: > users.id]
  content text
  is_read boolean [default: false]
  created_at datetime [default: `now()`]
}

Table notifications {
  id int [pk, increment]
  user_id int [ref: > users.id]
  type varchar(50) // e.g., 'like', 'comment', 'follow', 'message'
  content text
  is_read boolean [default: false]
  created_at datetime [default: `now()`]
}
