src/
├── index.ts                     # Entry point
├── ws/                          # WebSocket setup
│   ├── server.ts                # WebSocket server
│   └── handlers/                # WS event handlers
│       ├── onJoin.ts
│       ├── onStartGame.ts
│       ├── onPlayCard.ts
│       ├── onVote.ts
│       └── onDisconnect.ts
├── controllers/                 # Validate and orchestrate actions
│   ├── roomController.ts
│   └── gameController.ts
├── services/                    # Game logic (business rules)
│   ├── roomService.ts
│   ├── gameService.ts
│   ├── cardService.ts
│   └── voteService.ts
├── models/                      # Typebox schemas and types
│   ├── player.ts
│   ├── room.ts
│   ├── game.ts
│   └── card.ts
├── store/                       # In-memory store or Redis wrappers
│   ├── roomStore.ts
│   └── gameStore.ts
├── db/                          # Persistence layer (DB access)
│   ├── entities.ts              # Drizzle entities (rooms, players, cards)
│   └── roomRepository.ts
├── utils/                       # Helper functions
│   ├── broadcaster.ts           # Send to room, player, etc.
│   └── shuffle.ts
└── schemas/                     # Typebox request/response schemas
    ├── messages.ts
    └── shared.ts
