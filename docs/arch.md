So, using Single-Source of truth - server is only responsible for managing the data and business logic, while the client is responsible for rendering the UI and handling user interactions. This approach allows for a more scalable and maintainable architecture, as well as better separation of concerns.

Because of it, we can easily update the data and business logic without having to worry about breaking the client-side code. This also allows us to easily add new features and functionality to the application without having to worry about the client-side code. Additionally, it allows for a more efficient use of resources, as the server can handle the heavy lifting of data management and business logic, while the client can focus on rendering the UI and handling user interactions.

We are have rooms of games. The room should store:
- Players
- Game state
- Room ID
- Room owner

Game state should store:
- Players
- Cards - Deck, Hands, Discard and Draw Pile.
I.e., game state should store deck id, current array of draw pile (when users join and use card, they are got new cards from this pile). Should it be stored in database? Yes, it should be stored in database for now. Although, we can consider using a cache for faster access. Using RAM or Redis.
- Current leader player
- Winner

We should send cards only when Game started, not when player connected. When we create room with defined deck, we create draw pile shuffling it and store it somewhere. Then, when game starts, we send hands of players from draw pile. And when player plays card, we send new card from this pile.

Ah, also we store entire array of current hand of player, to ensure that player can't cheat by looking at other players' hands. We also store the current state of the game, including the current player's turn, the current card played, and the current score. This allows us to easily implement features such as undoing moves and replaying games.
So, at new turn, we send entire array of current hand of player.

When voting starts, we are sending shuffled array of voted cards to all players, without revealing the identity of the player who played the card. And when voting ends, we send the result of the vote to all players. When voting ends, players send their votes to the server with schema {voterId, cardId}. Then server calculates scores and sends them to all players.
