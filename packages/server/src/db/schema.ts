import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const scenes = sqliteTable('scenes', {
  id:              text('id').primaryKey(),
  name:            text('name').notNull(),
  backgroundImage: text('background_image'),
  width:           integer('width').notNull().default(2000),
  height:          integer('height').notNull().default(2000),
  gridConfig:      text('grid_config').notNull(),   // JSON
  walls:           text('walls').notNull().default('[]'),
  doors:           text('doors').notNull().default('[]'),
  lights:          text('lights').notNull().default('[]'),
  ambientLight:    real('ambient_light').notNull().default(0.3),
  fogExplored:     integer('fog_explored', { mode: 'boolean' }).notNull().default(true),
  updatedAt:       integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const tokens = sqliteTable('tokens', {
  id:          text('id').primaryKey(),
  sceneId:     text('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }),
  characterId: text('character_id'),
  name:        text('name').notNull(),
  type:        text('type').notNull().default('npc'),
  imageUrl:    text('image_url'),
  gridCoord:   text('grid_coord').notNull(),   // JSON GridCoord
  pixelX:      real('pixel_x').notNull().default(0),
  pixelY:      real('pixel_y').notNull().default(0),
  hp:          integer('hp'),
  hpMax:       integer('hp_max'),
  conditions:  text('conditions').notNull().default('[]'),
  visible:     integer('visible', { mode: 'boolean' }).notNull().default(true),
  size:        integer('size').notNull().default(1),
})

export const characters = sqliteTable('characters', {
  id:         text('id').primaryKey(),
  name:       text('name').notNull(),
  race:       text('race'),
  profession: text('profession'),
  level:      integer('level').notNull().default(1),
  stats:      text('stats').notNull().default('{}'),  // JSON
  inventory:  text('inventory').notNull().default('[]'),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const journals = sqliteTable('journals', {
  id:          text('id').primaryKey(),
  ownerId:     text('owner_id').notNull(),
  title:       text('title').notNull(),
  content:     text('content').notNull().default(''),
  sharedWith:  text('shared_with').notNull().default('[]'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
