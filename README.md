# The AI Games

Lightweight web app offering AI-powered board-game matchups. Currently includes:
- Tic Tac Toe with minimax-driven CPU across three difficulties
- Connect 4 with alpha-beta–pruned minimax (easy/medium/hard)
- Chess teaser (coming soon)

## Running locally
```bash
npm install
npm start
```
Then open http://localhost:3000.

## Docker
```bash
docker build -t theaigames .
docker run -p 3000:3000 theaigames
```
