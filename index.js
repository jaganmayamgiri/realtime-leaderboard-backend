// Custom Min-Heap implementation for top N scores
class MinHeap {
    constructor(maxSize) {
        this.heap = [];
        this.maxSize = maxSize;
    }

    parent(i) {
        return Math.floor((i - 1) / 2);
    }

    leftChild(i) {
        return 2 * i + 1;
    }

    rightChild(i) {
        return 2 * i + 2;
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    insert(score) {
        if (this.heap.length < this.maxSize) {
            this.heap.push(score);
            this.heapifyUp(this.heap.length - 1);
        } else if (score.score > this.heap[0].score) {
            this.heap[0] = score;
            this.heapifyDown(0);
        }
    }

    heapifyUp(i) {
        while (i > 0 && this.heap[this.parent(i)].score > this.heap[i].score) {
            this.swap(this.parent(i), i);
            i = this.parent(i);
        }
    }

    heapifyDown(i) {
        let minIndex = i;
        const left = this.leftChild(i);
        const right = this.rightChild(i);

        if (left < this.heap.length && this.heap[left].score < this.heap[minIndex].score) {
            minIndex = left;
        }

        if (right < this.heap.length && this.heap[right].score < this.heap[minIndex].score) {
            minIndex = right;
        }

        if (i !== minIndex) {
            this.swap(i, minIndex);
            this.heapifyDown(minIndex);
        }
    }

    getSortedScores() {
        return [...this.heap].sort((a, b) => b.score - a.score);
    }
}

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Initialize heap with max size of 100
const leaderboard = new MinHeap(100);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Routes
app.post('/add_score', (req, res) => {
    try {
        const { name, score } = req.body;
        
        if (!name || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid input. Name and score are required.' });
        }

        leaderboard.insert({ name, score });
        res.json({ message: 'Score added successfully', scores: leaderboard.getSortedScores() });
    } catch (error) {
        console.error('Error adding score:', error);
        res.status(500).json({ error: 'Failed to add score' });
    }
});

app.get('/get_leaderboard', (req, res) => {
    try {
        res.json(leaderboard.getSortedScores());
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
}); 